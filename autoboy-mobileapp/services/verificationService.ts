import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'https://api.autoboy.ng/v1';

export interface VerificationDocument {
  type: 'nin' | 'bvn' | 'passport' | 'drivers_license';
  number: string;
  frontImage?: string;
  backImage?: string;
}

export interface VerificationResponse {
  success: boolean;
  verificationId: string;
  status: 'pending' | 'verified' | 'failed';
  confidence: number;
  message: string;
}

class VerificationService {
  private apiKey = 'your-api-key';

  async verifyNIN(nin: string): Promise<VerificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/identity/nin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ nin }),
      });

      const data = await response.json();
      
      return {
        success: data.status === 'success',
        verificationId: data.data?.id || '',
        status: data.data?.status || 'pending',
        confidence: data.data?.confidence || 0,
        message: data.message || 'NIN verification initiated'
      };
    } catch (error) {
      throw new Error('NIN verification failed');
    }
  }

  async verifyBVN(bvn: string): Promise<VerificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/identity/bvn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ bvn }),
      });

      const data = await response.json();
      
      return {
        success: data.status === 'success',
        verificationId: data.data?.id || '',
        status: data.data?.status || 'pending',
        confidence: data.data?.confidence || 0,
        message: data.message || 'BVN verification initiated'
      };
    } catch (error) {
      throw new Error('BVN verification failed');
    }
  }

  async verifyDocument(document: VerificationDocument): Promise<VerificationResponse> {
    try {
      const formData = new FormData();
      formData.append('document_type', document.type);
      formData.append('document_number', document.number);
      
      if (document.frontImage) {
        formData.append('front_image', {
          uri: document.frontImage,
          type: 'image/jpeg',
          name: 'front.jpg',
        } as any);
      }

      const response = await fetch(`${API_BASE_URL}/identity/document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      
      return {
        success: data.status === 'success',
        verificationId: data.data?.id || '',
        status: data.data?.status || 'pending',
        confidence: data.data?.confidence || 0,
        message: data.message || 'Document verification initiated'
      };
    } catch (error) {
      throw new Error('Document verification failed');
    }
  }

  async verifyFace(selfieImage: string): Promise<VerificationResponse> {
    try {
      const formData = new FormData();
      formData.append('selfie_image', {
        uri: selfieImage,
        type: 'image/jpeg',
        name: 'selfie.jpg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/identity/face`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      
      return {
        success: data.status === 'success',
        verificationId: data.data?.id || '',
        status: data.data?.status || 'pending',
        confidence: data.data?.confidence || 0,
        message: data.message || 'Facial verification initiated'
      };
    } catch (error) {
      throw new Error('Facial verification failed');
    }
  }

  async captureSelfie(): Promise<string> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission required');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    
    throw new Error('Selfie capture cancelled');
  }

  async getVerificationStatus(verificationId: string): Promise<VerificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/identity/status/${verificationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const data = await response.json();
      
      return {
        success: data.status === 'success',
        verificationId: verificationId,
        status: data.data?.status || 'pending',
        confidence: data.data?.confidence || 0,
        message: data.message || 'Verification status retrieved'
      };
    } catch (error) {
      throw new Error('Failed to get verification status');
    }
  }
}

export default new VerificationService();