package org.projekt.services;

import org.projekt.models.Box;
import org.projekt.repositories.BoxRepository;
import org.springframework.stereotype.Service;

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
        return boxRepository.save(box);
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
            box.setVolume(updatedBox.getVolume());
            box.setWeight(updatedBox.getWeight());
            box.setVolumeTotal(updatedBox.getVolumeTotal());
            box.setWeightTotal(updatedBox.getWeightTotal());
            return boxRepository.save(box);
        }).orElseThrow(() -> new RuntimeException("Box not found"));
    }

    // DELETE
    public void deleteBox(Long id) {
        boxRepository.deleteById(id);
    }
}
