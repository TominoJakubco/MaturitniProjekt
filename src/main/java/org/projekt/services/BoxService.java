package org.projekt.services;

import org.projekt.models.Box;
import org.projekt.repositories.BoxRepository;
import org.springframework.stereotype.Service;
import org.apache.poi.ss.usermodel.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@Service
public class BoxService {

    public final BoxRepository boxRepository;

    public BoxService(BoxRepository boxRepository) {
        this.boxRepository = boxRepository;
    }

    // CREATE
    public Box createUser(Box box) {
        System.out.println("Received box: " + box.getName());
        box.setVolume( box.getLength() * box.getWidth() * box.getHeight());
        box.setWeightTotal(box.getWeight() * box.getAmount());
        box.setVolumeTotal(box.getVolume() * box.getAmount());
        return boxRepository.save(box);
    }


    public void importBoxesFromExcel(MultipartFile file) {
        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) { // row 0 = header
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Box box = new Box();
                box.setName(getString(row.getCell(0)));
                box.setAmount((int) getNumber(row.getCell(1)));
                box.setLength((int) getNumber(row.getCell(2)));
                box.setWidth((int) getNumber(row.getCell(3)));
                box.setHeight((int) getNumber(row.getCell(4)));
                box.setWeight(getNumber(row.getCell(5)));

                // TVOJE EXISTUJÍCÍ LOGIKA
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
            try {
                return Double.parseDouble(cell.getStringCellValue());
            } catch (Exception ignored) {}
        }
        return 0;
    }

    // READ - všechny boxy
    public List<Box> getAllBoxes() {
        return boxRepository.findAll();
    }

    // READ - jeden podle ID
    public Optional<Box> getBoxById(Long id) {
        return boxRepository.findById(id);
    }

    // UPDATE
    public Box updateBox(Long id, Box updatedBox) {
        return boxRepository.findById(id).map(box -> {
            box.setName(updatedBox.getName());
            box.setAmount(updatedBox.getAmount());
            box.setLength(updatedBox.getLength());
            box.setWidth(updatedBox.getWidth());
            box.setHeight(updatedBox.getHeight());
            box.setVolume(updatedBox.getLength() * updatedBox.getWidth() * updatedBox.getHeight());
            box.setWeight(updatedBox.getWeight());
            box.setVolumeTotal((double) (updatedBox.getLength() * updatedBox.getWidth() * updatedBox.getHeight() * updatedBox.getAmount()));
            box.setWeightTotal(updatedBox.getWeight() * updatedBox.getAmount());
            return boxRepository.save(box);
        }).orElseThrow(() -> new RuntimeException("Box not found"));
    }

    // DELETE
    public void deleteBox(Long id) {
        boxRepository.deleteById(id);
    }
}
