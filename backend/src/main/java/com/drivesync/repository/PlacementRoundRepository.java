package com.drivesync.repository;
import com.drivesync.model.PlacementRound;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PlacementRoundRepository extends JpaRepository<PlacementRound,Long> {
 List<PlacementRound> findByDriveIdOrderBySequenceNoAsc(Long driveId);
}
