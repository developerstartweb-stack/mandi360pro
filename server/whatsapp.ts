import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import QRCode from 'qrcode';
import { EventEmitter } from 'events';

class WhatsAppService extends EventEmitter {
  private client: any | null = null;
  private qrCode: string | null = null;
  private isAuthenticated: boolean = false;
  private isInitializing: boolean = false;
  private connectedPhone: string | null = null;

  constructor() {
    super();
  }

  async initialize() {
    // Allow re-initialization only if not currently initializing
    // If client exists but is not connected, destroy it first
    if (this.isInitializing) {
      return;
    }

    if (this.client && !this.isAuthenticated) {
      console.log('[WhatsApp] Cleaning up stale client before re-initialization');
      await this.client.destroy();
      this.client = null;
    }

    if (this.client && this.isAuthenticated) {
      console.log('[WhatsApp] Already initialized and authenticated');
      return;
    }

    this.isInitializing = true;

    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: './.wwebjs_auth'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      this.client.on('qr', async (qr) => {
        console.log('[WhatsApp] QR Code received');
        this.qrCode = await QRCode.toDataURL(qr);
        this.emit('qr', this.qrCode);
      });

      this.client.on('ready', () => {
        console.log('[WhatsApp] Client is ready');
        this.isAuthenticated = true;
        this.qrCode = null;
        
        const info = this.client!.info;
        if (info) {
          this.connectedPhone = info.wid.user;
        }
        
        this.emit('ready', {
          isAuthenticated: true,
          connectedPhone: this.connectedPhone
        });
      });

      this.client.on('authenticated', () => {
        console.log('[WhatsApp] Authenticated');
        this.isAuthenticated = true;
        this.emit('authenticated');
      });

      this.client.on('auth_failure', (msg) => {
        console.error('[WhatsApp] Authentication failure:', msg);
        this.isAuthenticated = false;
        this.emit('auth_failure', msg);
      });

      this.client.on('disconnected', (reason) => {
        console.log('[WhatsApp] Disconnected:', reason);
        this.isAuthenticated = false;
        this.connectedPhone = null;
        this.emit('disconnected', reason);
      });

      await this.client.initialize();
      this.isInitializing = false;
    } catch (error) {
      console.error('[WhatsApp] Initialization error:', error);
      this.isInitializing = false;
      this.emit('error', error);
      throw error;
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.client || !this.isAuthenticated) {
      throw new Error('WhatsApp client is not authenticated');
    }

    try {
      // Format phone number - remove any non-digits
      const formattedPhone = phoneNumber.replace(/\D/g, '');
      
      // Add country code if not present (assuming India +91)
      const fullPhone = formattedPhone.startsWith('91') ? formattedPhone : `91${formattedPhone}`;
      
      // Create WhatsApp chat ID
      const chatId = `${fullPhone}@c.us`;

      // Check if number exists on WhatsApp
      const isRegistered = await this.client.isRegisteredUser(chatId);
      
      if (!isRegistered) {
        throw new Error('This phone number is not registered on WhatsApp');
      }

      // Send message
      await this.client.sendMessage(chatId, message);
      console.log(`[WhatsApp] Message sent to ${phoneNumber}`);
      
      return true;
    } catch (error) {
      console.error('[WhatsApp] Error sending message:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      isInitializing: this.isInitializing,
      qrCode: this.qrCode,
      connectedPhone: this.connectedPhone,
      status: this.isAuthenticated ? 'connected' : (this.qrCode ? 'qr_ready' : 'disconnected')
    };
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isAuthenticated = false;
      this.isInitializing = false;
      this.qrCode = null;
      this.connectedPhone = null;
    }
  }

  async logout() {
    if (this.client) {
      await this.client.logout();
      this.client = null; // Reset client to allow re-initialization
      this.isAuthenticated = false;
      this.isInitializing = false;
      this.qrCode = null;
      this.connectedPhone = null;
    }
  }
}

// Singleton instance
export const whatsappService = new WhatsAppService();
