package org.projekt.TominoAlg;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 3D Bin Packing – X-Slice, v8  (definitive)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHAT WORKS (learned from v3) AND WHY WE KEEP IT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * v3 filled containers completely.  Its mechanics:
 *   1. Outer while-loop over Z-layers until container.height exhausted.
 *   2. computeLayerHeight: p75 of min-item-heights, hard-capped at min(p75, 40%),
 *      floored at smallest-fitting item.  Ensures multiple layers form.
 *   3. packLayer: 2D Extreme-Point placement in the X-Y plane at fixed Z=floorZ.
 *      EPs seeded at (0,0); after each placement add (maxX,minY) and (minX,maxY).
 *      Dominated EPs removed; cap at 128.
 *   4. Items eligible for a layer = those with min-height-rotation ≤ layerH.
 *      Items too tall are deferred to later layers — nothing is abandoned.
 *   5. Intersection check: X-range pre-prune then full intersects().
 *   6. Support: checked against items whose maxZ == floorZ.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * v8 CHANGE: AXIS SWAP  (Z-layers → X-slices)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Replace Z (height) as the outer loop axis with X (length, loading direction).
 *
 *   Container W×H×L  (e.g. 20×20×100):
 *     Old: fill 20×100 floor, next 20×100 floor, …   ← spreads along length
 *     New: fill 20×20 back wall, next 20×20 wall, …  ← builds toward front
 *
 * Exact mechanical mapping  v3→v8:
 *   floorZ          →  backX          (current slice back edge)
 *   layerH          →  sliceDepth     (X-extent of current slice)
 *   container.height→  container.getLength()
 *   container.height→  container.getLength() in computeSliceDepth
 *   X-Y plane EP    →  Y-Z plane EP
 *   EP (maxX,minY)  →  EP (maxY,minZ)
 *   EP (minX,maxY)  →  EP (minY,maxZ)
 *   item.getHeight()→  item.getLength() for slice-fit check
 *   x = ep.x, y = ep.y, z = floorZ  →  y = ep.y, z = ep.z, x = backX
 *   support surface: maxZ==floorZ   →  in-slice items with maxZ==cand.minZ
 *                                       + all placed items with maxZ==cand.minZ
 *
 * Everything else is IDENTICAL to v3.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * REALISM ADDITIONS (on top of v3 base):
 *   + Lateral face-contact area bonus (Y-face and X-face neighbours)
 *   + Void column penalty (floating above empty Y-column in slice)
 *   + Same-type face-adjacent bonus (same slice + adjacent slice)
 *   + Cluster isolation penalty
 *   + Column-continuity bonus (same Y-Z footprint as previous slice)
 *   + SliceProfile memory (topZ and typeId per Y-bucket)
 *   + Profile-matching type ordering
 *   + Profile EP seeding
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * KEY CORRECTNESS RULES (prevent half-fill):
 *
 *   R1. sliceDepth ≥ min(minDepths) always — no item is permanently locked out
 *       of all slices due to an over-aggressive cap.
 *
 *   R2. Items with depth > current sliceDepth remain in `remaining` and are
 *       retried in the NEXT slice (outer loop continues until remaining empty
 *       OR container exhausted).
 *
 *   R3. The 40% cap is applied ONLY when it would still leave room for items
 *       (i.e. capped value ≥ minDepths.get(0)). The floor always wins.
 *
 *   R4. frontX advances to the max(maxX) of ALL placed items in the slice,
 *       ensuring no gaps between slices.
 *
 *   R5. Support check uses ALL items in placedItems (not just supportSurface)
 *       whose maxZ == cand.minZ — handles items of varying depth that bridge
 *       slice boundaries.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * COORDINATE SYSTEM (unchanged):
 *   X = Length  (back=0 → front=L, loading direction)
 *   Y = Width   (left=0 → right=W)
 *   Z = Height  (floor=0 → ceiling=H)
 */
public class LayeredPackingAlgorithm {

    // ── tunables ──────────────────────────────────────────────────────────────
    private static final int    MAX_EPS        = 128;
    private static final int    PROFILE_CELLS  = 20;

    // Scoring weights
    private static final double W_BACK_WALL    = 12.0;   // low X (back of container)
    private static final double W_FLOOR        = 10.0;   // low Z (floor of slice)
    private static final double W_Y_WALL       =  8.0;   // touching Y=0 or Y=W wall
    private static final double W_SUPPORT      = 25.0;   // support ratio * stabilityWeight
    private static final double W_LATERAL      = 10.0;   // lateral face contact (per 1000 mm²)
    private static final double W_CLUSTER_ADJ  = 18.0;   // face-adjacent same-type neighbour
    private static final double W_CLUSTER_BREAK= 15.0;   // isolated from all same-type
    private static final double W_VOID_COL     = 16.0;   // floating above empty column
    private static final double W_COL_CONT     = 24.0;   // column continuation from prev slice
    private static final double W_PATTERN      = 18.0;   // typeId matches prev slice column

    // ── state ─────────────────────────────────────────────────────────────────
    private final PackingContainer container;
    private final List<PackingItem> items;
    private final PackingParameters parameters;
    private final List<PlacedItem>  placedItems;
    private final long              startTime;
    private int                     currentWeight = 0;
    private SliceProfile            prevProfile   = null;

    // ── constructor ───────────────────────────────────────────────────────────
    public LayeredPackingAlgorithm(PackingContainer container,
                                   List<PackingItem> items,
                                   PackingParameters parameters) {
        this.container   = container;
        this.items       = new ArrayList<>(items);
        this.parameters  = parameters;
        this.placedItems = new ArrayList<>();
        this.startTime   = System.currentTimeMillis();
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  ENTRY POINT  (mirrors v3 execute exactly, Z↔X swapped)
    // ══════════════════════════════════════════════════════════════════════════

    public PackingResult execute() {
        List<PackingItem> remaining = sortItems(new ArrayList<>(items));

        int sliceIdx = 0;
        int backX    = 0;   // ← was: floorZ = 0

        // ── outer loop: advance X slice-by-slice until length exhausted ────────
        //    Mirrors v3: while (!remaining.isEmpty() && floorZ < container.height)
        while (!remaining.isEmpty() && backX < container.getLength() && !isTimeout()) {

            int sliceDepth = computeSliceDepth(remaining, backX); // ← was: layerH
            if (sliceDepth <= 0) break;

            SliceResult sr = packSlice(remaining, backX, sliceDepth, sliceIdx);

            if (sr.placed.isEmpty()) break;  // nothing fit — stop

            // Commit
            placedItems.addAll(sr.placed);
            Set<String> packed = sr.placed.stream()
                    .map(p -> p.getItem().getId()).collect(Collectors.toSet());
            remaining.removeIf(it -> packed.contains(it.getId()));

            prevProfile = buildProfile(sr.placed);

            // ── advance backX to max front face of this slice (Rule R4) ────────
            //    Mirrors v3: floorZ = lr.ceilingZ
            backX = sr.frontX;
            sliceIdx++;
        }

        long elapsed = System.currentTimeMillis() - startTime;
        PackingStatistics stats = buildStatistics(elapsed, sliceIdx);
        return new PackingResult(placedItems, remaining, container, stats);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  SLICE DEPTH  (mirrors v3 computeLayerHeight, X↔Z)
    // ══════════════════════════════════════════════════════════════════════════

    private int computeSliceDepth(List<PackingItem> remaining, int backX) {
        int remainingX = container.getLength() - backX;
        if (remainingX <= 0) return 0;

        // Explicit override (reusing maxLayerHeight as slice depth)
        if (parameters.getMaxLayerHeight() > 0) {
            return Math.min(parameters.getMaxLayerHeight(), remainingX);
        }

        // Collect min X-dimension over all rotations, per item
        List<Integer> minDs = new ArrayList<>(remaining.size());
        for (PackingItem it : remaining) {
            int d = minXOverRotations(it);
            if (d <= remainingX) minDs.add(d);
        }
        if (minDs.isEmpty()) return 0;

        Collections.sort(minDs);

        // p75 — same as v3
        int p75 = minDs.get(Math.min(minDs.size() - 1, (int)(minDs.size() * 0.75)));

        // Cap at 40% of remaining (guarantees ≥ 3 slices can form)
        p75 = Math.min(p75, (int)(remainingX * 0.40));

        // Rule R1/R3: floor at smallest fitting item — never locks items out
        p75 = Math.max(p75, minDs.get(0));

        return Math.min(p75, remainingX);
    }

    private int minXOverRotations(PackingItem it) {
        if (!parameters.isAllowRotations()) return it.getLength();
        return it.getRotations(true).stream()
                .mapToInt(PackingItem::getLength)
                .min().orElse(it.getLength());
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  PACK ONE SLICE  (mirrors v3 packLayer, X-Y plane → Y-Z plane)
    // ══════════════════════════════════════════════════════════════════════════

    private SliceResult packSlice(List<PackingItem> available,
                                  int backX, int sliceDepth, int sliceIdx) {

        List<PlacedItem> placed  = new ArrayList<>();
        Set<String>      usedIds = new HashSet<>();
        int              frontX  = backX;   // ← was: ceilingZ = floorZ

        // ── support surface: all items already placed whose maxZ will be    ────
        //    referenced when stacking — Rule R5: use all placedItems filtered
        //    by maxZ at call time; checked per-candidate in computeSupportRatio
        // (no pre-filter needed; computeSupportRatio filters by maxZ == cand.minZ)

        // ── seed Y-Z extreme-point list (mirrors v3: EP at (0,0,floorZ)) ───────
        List<EP2> eps = new ArrayList<>();
        eps.add(new EP2(0, 0));

        // Profile EP seeding: give column-continuation positions a head start
        if (prevProfile != null) {
            for (int i = 0; i < PROFILE_CELLS; i++) {
                if (prevProfile.topZ[i] > 0) {
                    eps.add(new EP2(i * prevProfile.cellW, 0));
                    eps.add(new EP2(i * prevProfile.cellW, prevProfile.topZ[i]));
                }
            }
        }

        // ── eligible items: min-X-rotation ≤ sliceDepth (mirrors v3 canFitInLayer)
        List<PackingItem> eligible = available.stream()
                .filter(it -> fitsInSlice(it, sliceDepth))
                .collect(Collectors.toList());

        // ── group by typeId then reorder to put profile-matching types first ───
        Map<String, List<PackingItem>> byType = eligible.stream()
                .collect(Collectors.groupingBy(PackingItem::getTypeId,
                        LinkedHashMap::new, Collectors.toList()));

        List<String> typeOrder = profileMatchingOrder(byType.keySet());

        for (String tid : typeOrder) {
            for (PackingItem item : byType.get(tid)) {
                if (isTimeout()) break;
                if (usedIds.contains(item.getId())) continue;
                if (currentWeight + item.getWeight() > container.getMaxWeight()) continue;

                PlacementCandidate best =
                        findBestEP(item, eps, placed, backX, sliceDepth, sliceIdx);

                if (best == null) continue;

                PlacedItem pi = new PlacedItem(best.rot,
                        new Position(best.x, best.y, best.z), sliceIdx);
                placed.add(pi);
                usedIds.add(item.getId());
                currentWeight += best.rot.getWeight();
                frontX = Math.max(frontX, pi.getMaxX());   // Rule R4

                eps = updateEPs(eps, pi, placed);
            }
        }

        return new SliceResult(placed, frontX);
    }

    private boolean fitsInSlice(PackingItem it, int sliceDepth) {
        if (!parameters.isAllowRotations()) {
            return it.getLength() <= sliceDepth
                    && it.getWidth()  <= container.getWidth()
                    && it.getHeight() <= container.getHeight();
        }
        return it.getRotations(true).stream().anyMatch(r ->
                r.getLength() <= sliceDepth
                        && r.getWidth()  <= container.getWidth()
                        && r.getHeight() <= container.getHeight());
    }

    private List<String> profileMatchingOrder(Set<String> types) {
        if (prevProfile == null) return new ArrayList<>(types);
        Set<String> inProfile = new HashSet<>();
        for (String t : prevProfile.typeId) if (t != null) inProfile.add(t);
        List<String> pref = new ArrayList<>(), rest = new ArrayList<>();
        for (String t : types) (inProfile.contains(t) ? pref : rest).add(t);
        pref.addAll(rest);
        return pref;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  EXTREME-POINT PLACEMENT  (mirrors v3 findBestEP, Y-Z plane)
    // ══════════════════════════════════════════════════════════════════════════

    private PlacementCandidate findBestEP(PackingItem      item,
                                          List<EP2>        eps,
                                          List<PlacedItem> slicePlaced,
                                          int              backX,
                                          int              sliceDepth,
                                          int              sliceIdx) {
        PlacementCandidate best = null;

        List<PackingItem> rots = eligibleRotations(item, sliceDepth);
        if (rots.isEmpty()) return null;

        for (EP2 ep : eps) {
            for (PackingItem rot : rots) {
                int x = backX;     // ← was: z = floorZ
                int y = ep.y;      // ← was: x = ep.x
                int z = ep.z;      // ← was: y = ep.y

                if (x + rot.getLength() > container.getLength()) continue;
                if (y + rot.getWidth()  > container.getWidth())  continue;
                if (z + rot.getHeight() > container.getHeight()) continue;

                PlacedItem cand = new PlacedItem(rot, new Position(x, y, z), sliceIdx);

                // Overlap: in-slice first (fast), then all placed (safety)
                if (intersects(cand, slicePlaced)) continue;
                if (intersects(cand, placedItems)) continue;

                // Support (Rule R5: uses all placedItems)
                double sr = supportRatio(cand, slicePlaced);
                if (z > 0 && sr < parameters.getMinSupportRatio()) continue;

                double sc = score(cand, slicePlaced, sr, sliceIdx);
                if (best == null || sc > best.score)
                    best = new PlacementCandidate(rot, x, y, z, sc);
            }
        }
        return best;
    }

    private List<PackingItem> eligibleRotations(PackingItem item, int sliceDepth) {
        if (!parameters.isAllowRotations()) {
            return (item.getLength() <= sliceDepth
                    && item.getWidth()  <= container.getWidth()
                    && item.getHeight() <= container.getHeight())
                    ? Collections.singletonList(item) : Collections.emptyList();
        }
        return item.getRotations(true).stream()
                .filter(r -> r.getLength() <= sliceDepth
                        && r.getWidth()  <= container.getWidth()
                        && r.getHeight() <= container.getHeight())
                .collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  SUPPORT RATIO  (Rule R5: checks ALL placedItems + slicePlaced)
    // ══════════════════════════════════════════════════════════════════════════

    private double supportRatio(PlacedItem cand, List<PlacedItem> slicePlaced) {
        if (cand.getMinZ() == 0) return 1.0;

        long base = (long) cand.getItem().getLength() * cand.getItem().getWidth();
        if (base == 0) return 1.0;

        int  targetZ   = cand.getMinZ();
        long supported = 0L;

        // In-slice items
        for (PlacedItem s : slicePlaced) {
            if (s.getMaxZ() == targetZ) supported += overlapXY(cand, s);
        }
        // All previously committed items (covers items from earlier slices)
        for (PlacedItem s : placedItems) {
            if (s.getMaxZ() == targetZ) supported += overlapXY(cand, s);
        }
        return Math.min(1.0, (double) supported / base);
    }

    private long overlapXY(PlacedItem a, PlacedItem b) {
        int x1 = Math.max(a.getMinX(), b.getMinX()), x2 = Math.min(a.getMaxX(), b.getMaxX());
        int y1 = Math.max(a.getMinY(), b.getMinY()), y2 = Math.min(a.getMaxY(), b.getMaxY());
        return (x2 > x1 && y2 > y1) ? (long)(x2 - x1) * (y2 - y1) : 0L;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  SCORING
    // ══════════════════════════════════════════════════════════════════════════

    private double score(PlacedItem p, List<PlacedItem> slicePlaced,
                         double sr, int sliceIdx) {
        double s = 0.0;
        String tid = p.getItem().getTypeId();

        // 1. Back-wall bias
        s += (1.0 - (double) p.getMinX() / container.getLength()) * W_BACK_WALL;

        // 2. Floor bias
        s += (1.0 - (double) p.getMinZ() / container.getHeight()) * W_FLOOR;

        // 3. Y-wall contact
        if (p.getMinY() == 0)                    s += W_Y_WALL;
        if (p.getMaxY() == container.getWidth()) s += W_Y_WALL;

        // 4. Support stability (same as v3 score)
        s += sr * parameters.getStabilityWeight() * W_SUPPORT;

        // 5. Lateral face-contact area (Y-face and X-face neighbours)
        s += lateralContact(p, slicePlaced) * W_LATERAL / 1_000.0;

        // 6. Void column penalty
        if (p.getMinZ() > 0) s -= voidPenalty(p, slicePlaced) * W_VOID_COL;

        // 7. Same-type face-adjacent (this slice)
        long adjSlice = slicePlaced.stream()
                .filter(q -> q.getItem().getTypeId().equals(tid) && faceTouching(p, q))
                .count();
        s += adjSlice * W_CLUSTER_ADJ * parameters.getClusteringWeight();

        // 8. Same-type in adjacent slices (column continuity + cross-slice clustering)
        long adjPrev = placedItems.stream()
                .filter(q -> q.getItem().getTypeId().equals(tid))
                .filter(q -> Math.abs(q.getLayerIndex() - sliceIdx) <= 1)
                .filter(q -> faceTouching(p, q) || xFaceTouching(p, q))
                .count();
        s += adjPrev * (W_CLUSTER_ADJ * 0.6) * parameters.getClusteringWeight();

        // 9. Isolation penalty
        boolean hasSameType = placedItems.stream()
                .anyMatch(q -> q.getItem().getTypeId().equals(tid));
        if (hasSameType && adjSlice == 0 && adjPrev == 0)
            s -= W_CLUSTER_BREAK * parameters.getClusteringWeight();

        // 10. Column continuation from previous slice
        if (prevProfile != null) s += columnContinuationBonus(p, tid);

        return s;
    }

    private double lateralContact(PlacedItem p, List<PlacedItem> others) {
        double area = 0;
        for (PlacedItem q : others) {
            // Y-face
            if (Math.abs(p.getMaxY() - q.getMinY()) <= 1
                    || Math.abs(p.getMinY() - q.getMaxY()) <= 1) {
                int ox = Math.min(p.getMaxX(), q.getMaxX()) - Math.max(p.getMinX(), q.getMinX());
                int oz = Math.min(p.getMaxZ(), q.getMaxZ()) - Math.max(p.getMinZ(), q.getMinZ());
                if (ox > 0 && oz > 0) area += (double) ox * oz;
            }
            // X-face
            if (Math.abs(p.getMaxX() - q.getMinX()) <= 1
                    || Math.abs(p.getMinX() - q.getMaxX()) <= 1) {
                int oy = Math.min(p.getMaxY(), q.getMaxY()) - Math.max(p.getMinY(), q.getMinY());
                int oz = Math.min(p.getMaxZ(), q.getMaxZ()) - Math.max(p.getMinZ(), q.getMinZ());
                if (oy > 0 && oz > 0) area += (double) oy * oz * 0.5;
            }
        }
        return area;
    }

    private double voidPenalty(PlacedItem p, List<PlacedItem> slicePlaced) {
        int step = Math.max(10, p.getItem().getWidth() / 3);
        int voids = 0, total = 0;
        for (int sy = p.getMinY(); sy < p.getMaxY(); sy += step) {
            total++;
            boolean filled = false;
            for (PlacedItem q : slicePlaced) {
                if (q.getMinY() <= sy && q.getMaxY() > sy
                        && q.getMinZ() == 0 && q.getMaxZ() >= p.getMinZ()) { filled = true; break; }
            }
            if (!filled) voids++;
        }
        if (total == 0) return 0;
        return ((double) voids / total) * ((double) p.getMinZ() / container.getHeight());
    }

    private double columnContinuationBonus(PlacedItem p, String tid) {
        double bonus = 0;
        int cellW = prevProfile.cellW;
        int covered = 0, continuing = 0, matching = 0;
        for (int i = 0; i < PROFILE_CELLS; i++) {
            int cy0 = i * cellW, cy1 = cy0 + cellW;
            if (cy1 <= p.getMinY() || cy0 >= p.getMaxY()) continue;
            covered++;
            if (prevProfile.topZ[i] == p.getMinZ()) continuing++;
            if (tid.equals(prevProfile.typeId[i]))   matching++;
        }
        if (covered > 0) {
            bonus += (double) continuing / covered * W_COL_CONT;
            bonus += (double) matching   / covered * W_PATTERN * parameters.getClusteringWeight();
        }
        return bonus;
    }

    private boolean faceTouching(PlacedItem p, PlacedItem q) {
        // Y-face
        if (Math.abs(p.getMaxY() - q.getMinY()) <= 1
                || Math.abs(p.getMinY() - q.getMaxY()) <= 1) {
            if (Math.min(p.getMaxX(), q.getMaxX()) > Math.max(p.getMinX(), q.getMinX())
                    && Math.min(p.getMaxZ(), q.getMaxZ()) > Math.max(p.getMinZ(), q.getMinZ()))
                return true;
        }
        // Z-face (stacking)
        if (Math.abs(p.getMaxZ() - q.getMinZ()) <= 1
                || Math.abs(p.getMinZ() - q.getMaxZ()) <= 1) {
            if (Math.min(p.getMaxX(), q.getMaxX()) > Math.max(p.getMinX(), q.getMinX())
                    && Math.min(p.getMaxY(), q.getMaxY()) > Math.max(p.getMinY(), q.getMinY()))
                return true;
        }
        return false;
    }

    private boolean xFaceTouching(PlacedItem p, PlacedItem q) {
        if (Math.abs(p.getMaxX() - q.getMinX()) <= 1
                || Math.abs(p.getMinX() - q.getMaxX()) <= 1) {
            if (Math.min(p.getMaxY(), q.getMaxY()) > Math.max(p.getMinY(), q.getMinY())
                    && Math.min(p.getMaxZ(), q.getMaxZ()) > Math.max(p.getMinZ(), q.getMinZ()))
                return true;
        }
        return false;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  EP MANAGEMENT  (mirrors v3 updateExtremePoints, Y-Z plane)
    // ══════════════════════════════════════════════════════════════════════════

    private List<EP2> updateEPs(List<EP2> eps, PlacedItem placed, List<PlacedItem> slicePlaced) {
        List<EP2> upd = new ArrayList<>(eps);

        // ← v3: EP1=(maxX,minY), EP2=(minX,maxY)
        //   v8: EP1=(maxY,minZ), EP2=(minY,maxZ)
        upd.add(new EP2(placed.getMaxY(), placed.getMinZ()));
        upd.add(new EP2(placed.getMinY(), placed.getMaxZ()));

        // Prune out-of-bounds
        upd.removeIf(ep -> ep.y >= container.getWidth() || ep.z >= container.getHeight());

        // Prune occupied (EP inside a placed box in this slice)
        upd.removeIf(ep -> epOccupied(ep, slicePlaced));

        // Dominance prune (same as v3)
        upd = removeDominated(upd);

        // Cap at MAX_EPS sorted by y+z (prefer corners — same as v3 x+y sort)
        if (upd.size() > MAX_EPS) {
            upd.sort(Comparator.comparingInt(ep -> ep.y + ep.z));
            upd = new ArrayList<>(upd.subList(0, MAX_EPS));
        }
        return upd;
    }

    private boolean epOccupied(EP2 ep, List<PlacedItem> placed) {
        for (PlacedItem p : placed)
            if (ep.y >= p.getMinY() && ep.y < p.getMaxY()
                    && ep.z >= p.getMinZ() && ep.z < p.getMaxZ()) return true;
        return false;
    }

    private List<EP2> removeDominated(List<EP2> eps) {
        // EP a is dominated by b if b.y ≤ a.y AND b.z ≤ a.z
        // Mirrors v3: b.x ≤ a.x AND b.y ≤ a.y
        List<EP2> result = new ArrayList<>();
        outer:
        for (EP2 a : eps) {
            for (EP2 b : eps) {
                if (b != a && b.y <= a.y && b.z <= a.z) continue outer;
            }
            result.add(a);
        }
        return result;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  INTERSECTION  (same as v3, X-range pre-prune)
    // ══════════════════════════════════════════════════════════════════════════

    private boolean intersects(PlacedItem cand, List<PlacedItem> existing) {
        int cx1 = cand.getMinX(), cx2 = cand.getMaxX();
        for (PlacedItem p : existing) {
            if (p.getMaxX() <= cx1 || p.getMinX() >= cx2) continue;
            if (p.intersects(cand)) return true;
        }
        return false;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  SLICE PROFILE
    // ══════════════════════════════════════════════════════════════════════════

    private SliceProfile buildProfile(List<PlacedItem> placed) {
        SliceProfile prof = new SliceProfile(PROFILE_CELLS, container.getWidth());
        for (PlacedItem p : placed) {
            for (int i = 0; i < PROFILE_CELLS; i++) {
                int cy0 = i * prof.cellW, cy1 = cy0 + prof.cellW;
                if (cy1 <= p.getMinY() || cy0 >= p.getMaxY()) continue;
                if (p.getMaxZ() > prof.topZ[i]) {
                    prof.topZ[i]   = p.getMaxZ();
                    prof.typeId[i] = p.getItem().getTypeId();
                }
            }
        }
        return prof;
    }

    private static final class SliceProfile {
        final int[]    topZ;
        final String[] typeId;
        final int      cellW;
        SliceProfile(int cells, int width) {
            topZ   = new int[cells];
            typeId = new String[cells];
            cellW  = Math.max(1, width / cells);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  ITEM SORT  (identical to v3)
    // ══════════════════════════════════════════════════════════════════════════

    private List<PackingItem> sortItems(List<PackingItem> list) {
        list.sort((a, b) -> {
            int wc = Integer.compare(b.getWeight(), a.getWeight());
            if (wc != 0) return wc;
            int vc = Long.compare(b.getVolume(), a.getVolume());
            if (vc != 0) return vc;
            return a.getTypeId().compareTo(b.getTypeId());
        });
        return list;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private boolean isTimeout() {
        return System.currentTimeMillis() - startTime > parameters.getTimeoutMs();
    }

    private PackingStatistics buildStatistics(long elapsed, int slices) {
        long usedVol = placedItems.stream().mapToLong(p -> p.getItem().getVolume()).sum();
        int  usedWt  = placedItems.stream().mapToInt (p -> p.getItem().getWeight()).sum();
        double real  = new RealismScorer(parameters)
                .calculateRealismScore(placedItems, container);
        return new PackingStatistics(
                items.size(), placedItems.size(),
                usedVol, container.getVolume(),
                usedWt,  container.getMaxWeight(),
                real, elapsed, slices);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  INNER CLASSES
    // ══════════════════════════════════════════════════════════════════════════

    private static final class SliceResult {
        final List<PlacedItem> placed;
        final int frontX;
        SliceResult(List<PlacedItem> p, int fx) { placed = p; frontX = fx; }
    }

    private static final class EP2 {
        final int y, z;
        EP2(int y, int z) { this.y = y; this.z = z; }
        @Override public boolean equals(Object o) {
            return o instanceof EP2 && ((EP2)o).y == y && ((EP2)o).z == z;
        }
        @Override public int hashCode() { return Objects.hash(y, z); }
    }

    private static final class PlacementCandidate {
        final PackingItem rot;
        final int x, y, z;
        final double score;
        PlacementCandidate(PackingItem r, int x, int y, int z, double s) {
            rot = r; this.x = x; this.y = y; this.z = z; score = s;
        }
    }
}