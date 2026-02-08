package com.cms.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * QR Code Service - Generates QR codes for complaint tracking.
 * 
 * Creates QR codes that link to the complaint tracking page,
 * allowing customers to quickly access their complaint status.
 * Uses ZXing library for QR code generation.
 * 
 * @author CMS Development Team
 * @version 1.0
 */
@Service
@Slf4j
public class QRCodeService {

    @Value("${app.base-url:https://cms.example.com}")
    private String baseUrl;

    private static final int DEFAULT_SIZE = 300;
    private static final String DEFAULT_FORMAT = "PNG";

    /**
     * Generate a QR code for tracking a complaint.
     * Returns the QR code as a byte array.
     */
    public byte[] generateComplaintTrackingQR(String complaintId) {
        return generateComplaintTrackingQR(complaintId, DEFAULT_SIZE);
    }

    /**
     * Generate a QR code with custom size.
     */
    public byte[] generateComplaintTrackingQR(String complaintId, int size) {
        String trackingUrl = buildTrackingUrl(complaintId);
        return generateQRCode(trackingUrl, size);
    }

    /**
     * Generate a QR code as Base64 encoded string.
     * Useful for embedding directly in HTML/emails.
     */
    public String generateComplaintTrackingQRBase64(String complaintId) {
        byte[] qrBytes = generateComplaintTrackingQR(complaintId);
        return Base64.getEncoder().encodeToString(qrBytes);
    }

    /**
     * Generate QR code with company logo overlay.
     */
    public byte[] generateBrandedQR(String complaintId, byte[] logoBytes) {
        try {
            String trackingUrl = buildTrackingUrl(complaintId);
            BufferedImage qrImage = generateQRCodeImage(trackingUrl, DEFAULT_SIZE);

            if (logoBytes != null && logoBytes.length > 0) {
                qrImage = overlayLogo(qrImage, logoBytes);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(qrImage, DEFAULT_FORMAT, outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            log.error("Error generating branded QR code for complaint {}", complaintId, e);
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    /**
     * Generate a generic QR code from any content.
     */
    public byte[] generateQRCode(String content, int size) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();

            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 2);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            BitMatrix bitMatrix = qrCodeWriter.encode(
                    content,
                    BarcodeFormat.QR_CODE,
                    size,
                    size,
                    hints);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, DEFAULT_FORMAT, outputStream);

            log.debug("Generated QR code for content: {}..., size: {}x{}",
                    content.substring(0, Math.min(30, content.length())), size, size);

            return outputStream.toByteArray();

        } catch (WriterException | IOException e) {
            log.error("Error generating QR code for content: {}", content, e);
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    /**
     * Generate QR code as BufferedImage for further processing.
     */
    private BufferedImage generateQRCodeImage(String content, int size) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();

            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 2);

            BitMatrix bitMatrix = qrCodeWriter.encode(
                    content,
                    BarcodeFormat.QR_CODE,
                    size,
                    size,
                    hints);

            return MatrixToImageWriter.toBufferedImage(bitMatrix);

        } catch (WriterException e) {
            throw new RuntimeException("Failed to generate QR code image", e);
        }
    }

    /**
     * Overlay a logo in the center of the QR code.
     */
    private BufferedImage overlayLogo(BufferedImage qrImage, byte[] logoBytes) throws IOException {
        BufferedImage logo = ImageIO.read(new java.io.ByteArrayInputStream(logoBytes));

        int qrSize = qrImage.getWidth();
        int logoSize = qrSize / 5; // Logo is 20% of QR code size

        // Resize logo
        Image scaledLogo = logo.getScaledInstance(logoSize, logoSize, Image.SCALE_SMOOTH);
        BufferedImage scaledLogoImage = new BufferedImage(logoSize, logoSize, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = scaledLogoImage.createGraphics();
        g2d.drawImage(scaledLogo, 0, 0, null);
        g2d.dispose();

        // Calculate center position
        int x = (qrSize - logoSize) / 2;
        int y = (qrSize - logoSize) / 2;

        // Draw logo on QR code
        Graphics2D qrGraphics = qrImage.createGraphics();
        qrGraphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // White background behind logo
        qrGraphics.setColor(Color.WHITE);
        qrGraphics.fillRoundRect(x - 5, y - 5, logoSize + 10, logoSize + 10, 10, 10);

        // Draw logo
        qrGraphics.drawImage(scaledLogoImage, x, y, null);
        qrGraphics.dispose();

        return qrImage;
    }

    /**
     * Build the tracking URL for a complaint.
     */
    private String buildTrackingUrl(String complaintId) {
        return String.format("%s/track/%s", baseUrl, complaintId);
    }

    /**
     * Validate QR code content length.
     * QR codes have a maximum capacity.
     */
    public boolean isContentValid(String content) {
        // Version 40-L QR code can hold up to 7089 numeric, 4296 alphanumeric,
        // or 2953 bytes in binary/byte mode
        return content != null && content.length() <= 2953;
    }
}
