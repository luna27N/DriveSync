package com.drivesync.repository;
import com.drivesync.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface RoundResultRepository extends JpaRepository<RoundResult,Long> {
 Optional<RoundResult> findByRoundIdAndApplicationId(Long roundId,Long applicationId);
 List<RoundResult> findByApplicationId(Long applicationId);
 List<RoundResult> findByRoundId(Long roundId);
}
