-- Insert sample Islamic learning benchmarks
INSERT INTO islamic_learning_benchmarks (
  skill_area, age_range_min, age_range_max, proficiency_level, 
  benchmark_criteria, islamic_significance, assessment_methods,
  quranic_references, hadith_references, scholarly_consensus
) VALUES 
('Daily Prayers (Salah)', 5, 8, 'beginner', 
 '{"knows_prayer_times": true, "can_perform_wudu": true, "knows_basic_movements": true, "recites_fatihah": true}',
 'Fundamental pillar of Islam, establishes connection with Allah',
 '[{"name": "practical_demonstration", "weight": 0.6}, {"name": "verbal_recitation", "weight": 0.4}]',
 '["Quran 2:238", "Quran 4:103"]',
 '["Teach your children to pray when they are seven years old"]',
 'Universally agreed upon by Islamic scholars as foundational'
),
('Quran Recitation', 4, 12, 'progressive',
 '{"knows_arabic_letters": true, "can_read_simple_verses": true, "proper_tajweed": false, "memorized_surahs": 3}',
 'Direct word of Allah, source of guidance and blessing',
 '[{"name": "recitation_assessment", "weight": 0.5}, {"name": "memorization_test", "weight": 0.3}, {"name": "comprehension_check", "weight": 0.2}]',
 '["Quran 17:78", "Quran 73:4"]',
 '["Read the Quran, for it will come as an intercessor for its companions on the Day of Resurrection"]',
 'Unanimous agreement on importance of early Quranic education'
),
('Islamic Character (Akhlaq)', 3, 15, 'comprehensive',
 '{"shows_respect_to_parents": true, "tells_truth": true, "shows_kindness": true, "helps_others": true, "controls_anger": false}',
 'Character development following Prophet Muhammad (PBUH) example',
 '[{"name": "behavioral_observation", "weight": 0.4}, {"name": "parent_feedback", "weight": 0.3}, {"name": "peer_interaction", "weight": 0.3}]',
 '["Quran 68:4", "Quran 3:134"]',
 '["The best of people are those who benefit others", "I was sent to perfect good character"]',
 'Central to Islamic education across all schools of thought'
),
('Islamic History Knowledge', 8, 14, 'intermediate',
 '{"knows_prophet_stories": true, "understands_early_islam": true, "knows_companions": true, "historical_timeline": false}',
 'Understanding Islamic heritage and role models',
 '[{"name": "story_telling", "weight": 0.4}, {"name": "timeline_quiz", "weight": 0.3}, {"name": "character_analysis", "weight": 0.3}]',
 '["Quran 12:111", "Quran 3:110"]',
 '["Learn your lineage to strengthen family ties"]',
 'Emphasized by scholars for identity formation'
),
('Du''a and Dhikr', 4, 10, 'beginner',
 '{"knows_basic_duas": true, "understands_meanings": false, "regular_dhikr": false, "personal_dua": true}',
 'Constant remembrance and connection with Allah',
 '[{"name": "recitation_test", "weight": 0.5}, {"name": "application_assessment", "weight": 0.3}, {"name": "understanding_check", "weight": 0.2}]',
 '["Quran 2:186", "Quran 13:28"]',
 '["Dua is the essence of worship"]',
 'Fundamental practice recognized by all Islamic traditions'
);

-- Insert sample Islamic education scholars
INSERT INTO islamic_education_scholars (
  scholar_name, credentials, educational_background,
  islamic_methodology_expertise, active_research_areas,
  community_affiliations, approval_authority_level
) VALUES
('Dr. Amina Hassan', 'PhD Islamic Studies, MA Child Development', 
 'Al-Azhar University, Harvard Graduate School of Education',
 '["Montessori Islamic Integration", "Character Development", "Early Childhood Islamic Education"]',
 '["Digital Islamic Learning", "Culturally Responsive Islamic Pedagogy", "Family-Centered Islamic Education"]',
 '["Islamic Society of North America", "International Islamic Education Association"]',
 'expert'
),
('Sheikh Omar Al-Mahmoud', 'PhD Islamic Jurisprudence, MA Educational Psychology',
 'Islamic University of Medina, University of Oxford',
 '["Classical Islamic Curriculum", "Hadith Pedagogy", "Islamic Assessment Methods"]',
 '["Technology in Islamic Education", "Inclusive Islamic Learning", "Spiritual Development Metrics"]',
 '["World Islamic Education Council", "Global Islamic Schools Association"]',
 'authority'
),
('Dr. Fatima Al-Zahra', 'PhD Quranic Studies, MEd Curriculum Design',
 'Cairo University, Columbia Teachers College',
 '["Quranic Pedagogy", "Tajweed Instruction", "Islamic Language Arts"]',
 '["Multilingual Islamic Education", "Cognitive Science in Quran Learning", "AI-Assisted Islamic Teaching"]',
 '["International Quranic Education Institute", "American Islamic Education Foundation"]',
 'specialist'
);

-- Insert sample curriculum standards
INSERT INTO islamic_curriculum_standards (
  standard_name, subject_area, grade_level, learning_objective,
  quranic_foundations, hadith_foundations, fiqh_elements, 
  aqeedah_components, akhlaq_development, skill_competencies,
  assessment_rubric, progression_pathway, scholar_approved
) VALUES
('Foundations of Salah', 'Islamic Worship', 2, 
 'Students will understand and demonstrate the basic elements of Islamic prayer',
 '[{"verse": "Quran 2:238", "context": "Guard your prayers"}, {"verse": "Quran 4:103", "context": "Prayer at prescribed times"}]',
 '[{"hadith": "Command your children to pray at age 7", "source": "Abu Dawud"}, {"hadith": "Prayer is the pillar of religion", "source": "Bukhari"}]',
 '[{"element": "Wudu requirements", "importance": "high"}, {"element": "Prayer times", "importance": "high"}]',
 '[{"belief": "Allah hears our prayers", "evidence": "Quranic verses"}, {"belief": "Prayer connects us to Allah", "evidence": "Prophetic tradition"}]',
 '[{"trait": "Discipline", "development": "Through regular prayer"}, {"trait": "Humility", "development": "Through submission to Allah"}]',
 '{"recitation": 0.3, "movements": 0.3, "understanding": 0.2, "consistency": 0.2}',
 '[{"stage": "Recognition", "activities": ["Learning prayer names", "Identifying prayer times"]}, {"stage": "Practice", "activities": ["Guided prayer", "Wudu practice"]}]',
 true
),
('Quranic Character Stories', 'Islamic Ethics', 1,
 'Students will learn moral lessons from Quranic stories of prophets',
 '[{"verse": "Quran 12:111", "context": "Stories contain lessons"}, {"verse": "Quran 18:13", "context": "We relate true stories"}]',
 '[{"hadith": "Prophets are role models", "source": "Various"}, {"hadith": "Stories teach wisdom", "source": "Tirmidhi"}]',
 '[{"element": "Halal and Haram basics", "importance": "medium"}]',
 '[{"belief": "Prophets are chosen by Allah", "evidence": "Quranic stories"}, {"belief": "Good character is rewarded", "evidence": "Prophet stories"}]',
 '[{"trait": "Honesty", "development": "Through Prophet Yusuf story"}, {"trait": "Patience", "development": "Through Prophet Ayyub story"}]',
 '{"story_recall": 0.3, "moral_understanding": 0.4, "character_application": 0.3}',
 '[{"stage": "Listening", "activities": ["Story narration", "Picture books"]}, {"stage": "Understanding", "activities": ["Discussion", "Role play"]}]',
 true
),
('Islamic Greetings and Manners', 'Islamic Social Skills', 1,
 'Students will practice Islamic etiquette in daily interactions',
 '[{"verse": "Quran 4:86", "context": "Return greetings with better"}, {"verse": "Quran 24:27", "context": "Seek permission before entering"}]',
 '[{"hadith": "Spread greetings of peace", "source": "Bukhari"}, {"hadith": "Smile is charity", "source": "Tirmidhi"}]',
 '[{"element": "Eating etiquette", "importance": "medium"}, {"element": "Speaking etiquette", "importance": "high"}]',
 '[{"belief": "Muslims are brothers/sisters", "evidence": "Quranic teaching"}]',
 '[{"trait": "Respect", "development": "Through proper greetings"}, {"trait": "Kindness", "development": "Through Islamic manners"}]',
 '{"verbal_skills": 0.4, "behavioral_demonstration": 0.4, "consistency": 0.2}',
 '[{"stage": "Modeling", "activities": ["Teacher demonstration", "Peer examples"]}, {"stage": "Practice", "activities": ["Role play", "Daily application"]}]',
 true
);