package com.cms.service;

import com.cms.model.Complaint.Sentiment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Sentiment Analysis Service - AI-powered text sentiment detection.
 * 
 * Analyzes complaint descriptions to detect customer emotional state.
 * Uses keyword-based analysis with weighted scoring.
 * Can be extended to use ML models (TensorFlow, OpenNLP, etc.)
 * 
 * @author CMS Development Team
 * @version 1.0
 */
@Service
@Slf4j
public class SentimentAnalysisService {

    // Weighted keyword dictionaries
    private static final Map<String, Integer> ANGRY_KEYWORDS = Map.ofEntries(
            Map.entry("terrible", -3),
            Map.entry("worst", -3),
            Map.entry("horrible", -3),
            Map.entry("unacceptable", -3),
            Map.entry("disgusted", -3),
            Map.entry("outraged", -3),
            Map.entry("furious", -3),
            Map.entry("angry", -2),
            Map.entry("broken", -2),
            Map.entry("outage", -2),
            Map.entry("useless", -2),
            Map.entry("scam", -3),
            Map.entry("fraud", -3),
            Map.entry("lawsuit", -3),
            Map.entry("lawsuit", -3));

    private static final Map<String, Integer> FRUSTRATED_KEYWORDS = Map.ofEntries(
            Map.entry("disappointed", -1),
            Map.entry("annoying", -1),
            Map.entry("frustrated", -1),
            Map.entry("slow", -1),
            Map.entry("failing", -1),
            Map.entry("failed", -1),
            Map.entry("waiting", -1),
            Map.entry("stuck", -1),
            Map.entry("problem", -1),
            Map.entry("issue", -1),
            Map.entry("doesn't work", -1),
            Map.entry("not working", -1),
            Map.entry("bug", -1),
            Map.entry("error", -1));

    private static final Map<String, Integer> POSITIVE_KEYWORDS = Map.ofEntries(
            Map.entry("thank", 2),
            Map.entry("thanks", 2),
            Map.entry("great", 2),
            Map.entry("excellent", 3),
            Map.entry("amazing", 3),
            Map.entry("helpful", 2),
            Map.entry("appreciate", 2),
            Map.entry("satisfied", 2),
            Map.entry("good", 1),
            Map.entry("resolved", 1));

    // Intensifiers that multiply the sentiment weight
    private static final Set<String> INTENSIFIERS = Set.of(
            "very", "extremely", "incredibly", "absolutely", "completely",
            "totally", "really", "so", "quite");

    // Negators that flip the sentiment
    private static final Set<String> NEGATORS = Set.of(
            "not", "never", "no", "don't", "doesn't", "didn't", "won't",
            "can't", "couldn't", "shouldn't", "wouldn't");

    /**
     * Analyze the sentiment of given text.
     * Returns ANGRY, FRUSTRATED, NEUTRAL, or SATISFIED.
     */
    public Sentiment analyzeSentiment(String text) {
        if (text == null || text.isBlank()) {
            return Sentiment.NEUTRAL;
        }

        String normalizedText = normalizeText(text);
        int score = calculateSentimentScore(normalizedText);
        Sentiment sentiment = scoreToSentiment(score);

        log.debug("Sentiment analysis - Text: '{}...', Score: {}, Sentiment: {}",
                text.substring(0, Math.min(50, text.length())), score, sentiment);

        return sentiment;
    }

    /**
     * Get detailed sentiment analysis with breakdown.
     */
    public SentimentAnalysisResult analyzeDetailed(String text) {
        String normalizedText = normalizeText(text);
        int score = calculateSentimentScore(normalizedText);
        Sentiment sentiment = scoreToSentiment(score);

        List<String> detectedKeywords = findMatchedKeywords(normalizedText);
        double confidence = calculateConfidence(score, detectedKeywords.size());

        return new SentimentAnalysisResult(sentiment, score, confidence, detectedKeywords);
    }

    private String normalizeText(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s']", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private int calculateSentimentScore(String text) {
        int score = 0;
        String[] words = text.split("\\s+");

        for (int i = 0; i < words.length; i++) {
            String word = words[i];
            int multiplier = 1;

            // Check for preceding intensifier
            if (i > 0 && INTENSIFIERS.contains(words[i - 1])) {
                multiplier = 2;
            }

            // Check for preceding negator (flips sentiment)
            boolean negated = i > 0 && NEGATORS.contains(words[i - 1]);

            int wordScore = 0;
            if (ANGRY_KEYWORDS.containsKey(word)) {
                wordScore = ANGRY_KEYWORDS.get(word);
            } else if (FRUSTRATED_KEYWORDS.containsKey(word)) {
                wordScore = FRUSTRATED_KEYWORDS.get(word);
            } else if (POSITIVE_KEYWORDS.containsKey(word)) {
                wordScore = POSITIVE_KEYWORDS.get(word);
            }

            if (negated) {
                wordScore = -wordScore;
            }

            score += wordScore * multiplier;
        }

        // Check for multi-word phrases
        for (String phrase : FRUSTRATED_KEYWORDS.keySet()) {
            if (phrase.contains(" ") && text.contains(phrase)) {
                score += FRUSTRATED_KEYWORDS.get(phrase);
            }
        }

        return score;
    }

    private Sentiment scoreToSentiment(int score) {
        if (score <= -6) {
            return Sentiment.ANGRY;
        } else if (score <= -2) {
            return Sentiment.FRUSTRATED;
        } else if (score >= 3) {
            return Sentiment.SATISFIED;
        }
        return Sentiment.NEUTRAL;
    }

    private List<String> findMatchedKeywords(String text) {
        List<String> matched = new ArrayList<>();

        for (String keyword : ANGRY_KEYWORDS.keySet()) {
            if (text.contains(keyword))
                matched.add(keyword);
        }
        for (String keyword : FRUSTRATED_KEYWORDS.keySet()) {
            if (text.contains(keyword))
                matched.add(keyword);
        }
        for (String keyword : POSITIVE_KEYWORDS.keySet()) {
            if (text.contains(keyword))
                matched.add(keyword);
        }

        return matched;
    }

    private double calculateConfidence(int score, int keywordCount) {
        if (keywordCount == 0)
            return 0.5;
        double baseConfidence = Math.min(0.5 + (keywordCount * 0.1), 0.95);
        return baseConfidence;
    }

    // Result record for detailed analysis
    public record SentimentAnalysisResult(
            Sentiment sentiment,
            int score,
            double confidence,
            List<String> matchedKeywords) {
    }
}
