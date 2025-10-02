package services

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"autoboy-backend/utils"
)

type ImageService struct {
	cloudinaryURL string
	apiKey        string
	apiSecret     string
}

func NewImageService() *ImageService {
	return &ImageService{
		cloudinaryURL: utils.GetEnv("CLOUDINARY_CLOUD_NAME", ""),
		apiKey:        utils.GetEnv("CLOUDINARY_API_KEY", ""),
		apiSecret:     utils.GetEnv("CLOUDINARY_API_SECRET", ""),
	}
}

func (s *ImageService) UploadImage(imageData []byte, filename string) (string, error) {
	if s.cloudinaryURL == "" {
		return "", fmt.Errorf("cloudinary not configured")
	}

	// Create multipart form data
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Add file
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", err
	}
	_, err = part.Write(imageData)
	if err != nil {
		return "", err
	}

	// Add upload preset
	writer.WriteField("upload_preset", "autoboy_preset")
	writer.Close()

	// Make request to Cloudinary
	url := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/upload", s.cloudinaryURL)
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if secureURL, ok := result["secure_url"].(string); ok {
		return secureURL, nil
	}

	return "", fmt.Errorf("failed to get image URL from response")
}

func (s *ImageService) DeleteImage(imageURL string) error {
	if s.cloudinaryURL == "" {
		return fmt.Errorf("cloudinary not configured")
	}

	// Extract public ID from URL
	parts := strings.Split(imageURL, "/")
	if len(parts) < 2 {
		return fmt.Errorf("invalid image URL")
	}

	publicID := strings.TrimSuffix(parts[len(parts)-1], filepath.Ext(parts[len(parts)-1]))

	// Create deletion request
	url := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/destroy", s.cloudinaryURL)
	payload := map[string]string{
		"public_id": publicID,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	// Add authentication
	auth := base64.StdEncoding.EncodeToString([]byte(s.apiKey + ":" + s.apiSecret))
	req.Header.Set("Authorization", "Basic "+auth)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return err
	}

	if result["result"] != "ok" {
		return fmt.Errorf("failed to delete image: %v", result)
	}

	return nil
}