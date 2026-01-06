package org.projekt.services;

import org.projekt.models.Box;
import org.projekt.models.User;
import org.projekt.models.manytomany.UserBox;
import org.projekt.models.manytomany.UserBoxId;
import org.projekt.repositories.BoxRepository;
import org.projekt.repositories.UserBoxRepository;
import org.projekt.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@Service
public class BoxService {

    private final BoxRepository boxRepository;
    private final UserBoxRepository userBoxRepository;
    private final UserRepository userRepository;

    public BoxService(BoxRepository boxRepository, UserBoxRepository userBoxRepository, UserRepository userRepository) {
        this.boxRepository = boxRepository;
        this.userBoxRepository = userBoxRepository;
        this.userRepository = userRepository;
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    private boolean isAdmin(User user) {
        return user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    // ── CREATE ─────────────────────────────────────────────────────────────────

    public Box createBox(Box box, User owner) {
        box.setOwner(owner);
        box.setVolume(box.getLength() * box.getWidth() * box.getHeight());
        box.setWeightTotal(box.getWeight() * box.getAmount());
        box.setVolumeTotal(box.getVolume() * box.getAmount());
        return boxRepository.save(box);
    }

    // ── IMPORT z Excelu ────────────────────────────────────────────────────────

    public void importBoxesFromExcel(MultipartFile file, User owner) {
        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Box box = new Box();
                box.setOwner(owner);
                box.setName(getString(row.getCell(0)));
                box.setAmount((int) getNumber(row.getCell(1)));
                box.setLength((int) getNumber(row.getCell(2)));
                box.setWidth((int) getNumber(row.getCell(3)));
                box.setHeight((int) getNumber(row.getCell(4)));
                box.setWeight(getNumber(row.getCell(5)));

                box.setVolume(box.getLength() * box.getWidth() * box.getHeight());
                box.setWeightTotal(box.getWeight() * box.getAmount());
                box.setVolumeTotal(box.getVolume() * box.getAmount());

                boxRepository.save(box);
            }
        } catch (Exception e) {
            throw new RuntimeException("Excel import failed", e);
        }
    }

    private String getString(Cell cell) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue();
        if (cell.getCellType() == CellType.NUMERIC) return String.valueOf(cell.getNumericCellValue());
        return "";
    }

    private double getNumber(Cell cell) {
        if (cell == null) return 0;
        if (cell.getCellType() == CellType.NUMERIC) return cell.getNumericCellValue();
        if (cell.getCellType() == CellType.STRING) {
            try { return Double.parseDouble(cell.getStringCellValue()); } catch (Exception ignored) {}
        }
        return 0;
    }

    // ── READ ───────────────────────────────────────────────────────────────────

    public List<Box> getAllBoxes(User user) {
        if (!isAdmin(user)) throw new RuntimeException("Only admin can access all boxes");
        return boxRepository.findAll();
    }

    public List<Box> getVisibleBoxes(User user) {
        // Admin sees everything
        if (isAdmin(user)) return boxRepository.findAll();
        return boxRepository.findVisibleBoxes(user.getId());
    }

    public Optional<Box> getBoxByIdWithPermission(Long id, User user) {
        Optional<Box> boxOpt = boxRepository.findById(id);
        if (boxOpt.isEmpty()) return Optional.empty();
        Box box = boxOpt.get();

        // Admin always has access
        if (isAdmin(user)) return Optional.of(box);

        if (box.getOwner().getId().equals(user.getId())) return Optional.of(box);

        return userBoxRepository.findByUserAndBox(user, box)
                .filter(UserBox::isCanView)
                .map(ub -> box);
    }

    // ── UPDATE ─────────────────────────────────────────────────────────────────

    public Box updateBoxWithPermission(Long id, Box updatedBox, User user) {
        Box box = boxRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Box not found"));

        // Admin can edit anything
        if (!isAdmin(user)) {
            if (!box.getOwner().getId().equals(user.getId())) {
                UserBox permission = userBoxRepository.findByUserAndBox(user, box)
                        .orElseThrow(() -> new RuntimeException("No permission"));
                if (!permission.isCanEdit()) throw new RuntimeException("No permission to edit");
            }
        }

        box.setName(updatedBox.getName());
        box.setAmount(updatedBox.getAmount());
        box.setLength(updatedBox.getLength());
        box.setWidth(updatedBox.getWidth());
        box.setHeight(updatedBox.getHeight());
        box.setWeight(updatedBox.getWeight());

        box.setVolume(box.getLength() * box.getWidth() * box.getHeight());
        box.setVolumeTotal(box.getVolume() * box.getAmount());
        box.setWeightTotal(box.getWeight() * box.getAmount());

        return boxRepository.save(box);
    }

    // ── DELETE ─────────────────────────────────────────────────────────────────

    public void deleteBoxWithPermission(Long id, User user) {
        Box box = boxRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Box not found"));

        // Admin can delete anything
        if (!isAdmin(user)) {
            if (!box.getOwner().getId().equals(user.getId())) {
                UserBox permission = userBoxRepository.findByUserAndBox(user, box)
                        .orElseThrow(() -> new RuntimeException("No permission"));
                if (!permission.isCanEdit()) throw new RuntimeException("No permission to delete");
            }
        }

        boxRepository.delete(box);
    }

    // ── SHARE ──────────────────────────────────────────────────────────────────

    public UserBox shareBox(Long boxId, Long targetUserId, boolean canView, boolean canEdit, User owner) {
        Box box = boxRepository.findById(boxId)
                .orElseThrow(() -> new RuntimeException("Box not found"));

        // Admin can share any box regardless of ownership
        if (!isAdmin(owner) && !box.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Only owner can share the box");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        UserBox userBox = new UserBox(targetUser, box, canView, canEdit);
        return userBoxRepository.save(userBox);
    }
}