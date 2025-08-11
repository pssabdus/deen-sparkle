-- Insert sample Islamic learning benchmarks with correct column names
INSERT INTO islamic_learning_benchmarks (
  benchmark_name, skill_area, age_range_start, age_range_end, 
  benchmark_criteria, islamic_significance, assessment_methods,
  quranic_references, hadith_references, scholarly_consensus
) VALUES 
('Daily Prayers (Salah)', 'Islamic Worship', 5, 8,
 '{"knows_prayer_times": true, "can_perform_wudu": true, "knows_basic_movements": true, "recites_fatihah": true}',
 'Fundamental pillar of Islam, establishes connection with Allah',
 '[{"name": "practical_demonstration", "weight": 0.6}, {"name": "verbal_recitation", "weight": 0.4}]',
 '["Quran 2:238", "Quran 4:103"]',
 '["Teach your children to pray when they are seven years old"]',
 'Universally agreed upon by Islamic scholars as foundational'
),
('Quran Recitation', 'Quranic Studies', 4, 12,
 '{"knows_arabic_letters": true, "can_read_simple_verses": true, "proper_tajweed": false, "memorized_surahs": 3}',
 'Direct word of Allah, source of guidance and blessing',
 '[{"name": "recitation_assessment", "weight": 0.5}, {"name": "memorization_test", "weight": 0.3}, {"name": "comprehension_check", "weight": 0.2}]',
 '["Quran 17:78", "Quran 73:4"]',
 '["Read the Quran, for it will come as an intercessor for its companions on the Day of Resurrection"]',
 'Unanimous agreement on importance of early Quranic education'
),
('Islamic Character (Akhlaq)', 'Character Development', 3, 15,
 '{"shows_respect_to_parents": true, "tells_truth": true, "shows_kindness": true, "helps_others": true, "controls_anger": false}',
 'Character development following Prophet Muhammad (PBUH) example',
 '[{"name": "behavioral_observation", "weight": 0.4}, {"name": "parent_feedback", "weight": 0.3}, {"name": "peer_interaction", "weight": 0.3}]',
 '["Quran 68:4", "Quran 3:134"]',
 '["The best of people are those who benefit others", "I was sent to perfect good character"]',
 'Central to Islamic education across all schools of thought'
);

-- Insert sample Islamic education scholars with correct column names  
INSERT INTO islamic_education_scholars (
  scholar_name, credentials, educational_background,
  islamic_methodology_expertise, active_research_areas,
  community_affiliations, approval_authority_level, user_id
) VALUES
('Dr. Amina Hassan', 'PhD Islamic Studies, MA Child Development', 
 'Al-Azhar University, Harvard Graduate School of Education',
 '["Montessori Islamic Integration", "Character Development", "Early Childhood Islamic Education"]',
 '["Digital Islamic Learning", "Culturally Responsive Islamic Pedagogy", "Family-Centered Islamic Education"]',
 '["Islamic Society of North America", "International Islamic Education Association"]',
 'expert', gen_random_uuid()
),
('Sheikh Omar Al-Mahmoud', 'PhD Islamic Jurisprudence, MA Educational Psychology',
 'Islamic University of Medina, University of Oxford',
 '["Classical Islamic Curriculum", "Hadith Pedagogy", "Islamic Assessment Methods"]',
 '["Technology in Islamic Education", "Inclusive Islamic Learning", "Spiritual Development Metrics"]',
 '["World Islamic Education Council", "Global Islamic Schools Association"]',
 'authority', gen_random_uuid()
),
('Dr. Fatima Al-Zahra', 'PhD Quranic Studies, MEd Curriculum Design',
 'Cairo University, Columbia Teachers College',
 '["Quranic Pedagogy", "Tajweed Instruction", "Islamic Language Arts"]',
 '["Multilingual Islamic Education", "Cognitive Science in Quran Learning", "AI-Assisted Islamic Teaching"]',
 '["International Quranic Education Institute", "American Islamic Education Foundation"]',
 'specialist', gen_random_uuid()
);