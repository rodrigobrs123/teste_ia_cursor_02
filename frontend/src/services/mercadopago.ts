// Declare MercadoPago as a global variable
declare global {
  interface Window {
    MercadoPago?: any; // opcional, pois pode não estar carregado ainda
  }
}

export interface MercadoPagoConfig {
  public_key: string;
  sandbox: boolean;
}

export interface CardToken {
  id: string;
}

export interface CardData {
  number: string;
  holder_name: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
}

class MercadoPagoService {
  private mp: any = null;
  private config: MercadoPagoConfig | null = null;

  async initialize(): Promise<void> {
    try {
      // Get Mercado Pago configuration from backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/mercadopago/config`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to get Mercado Pago configuration');
      }

      this.config = result.data;

      // Aguarda o carregamento do SDK, caso ainda não esteja disponível
      await this.waitForMercadoPago();

      // Verifica se a configuração foi carregada corretamente
      if (!this.config) {
        throw new Error('MercadoPago configuration is not available');
      }

      // Inicializa o SDK
      this.mp = new window.MercadoPago(this.config.public_key, {
        locale: 'pt-BR'
      });

      console.log('✅ Mercado Pago initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing Mercado Pago:', error);
      throw error;
    }
  }

  /** Aguarda até que o SDK MercadoPago seja carregado no window */
  private async waitForMercadoPago(): Promise<void> {
    let attempts = 0;
    while (!window.MercadoPago && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 200)); // espera 200ms
      attempts++;
    }

    if (!window.MercadoPago) {
      throw new Error('Mercado Pago SDK not loaded in time');
    }
  }

  async createCardToken(cardData: CardData): Promise<CardToken> {
    if (!this.mp) {
      throw new Error('Mercado Pago not initialized');
    }

    try {
      const token = await this.mp.createCardToken({
        cardNumber: cardData.number.replace(/\s/g, ''),
        cardholderName: cardData.holder_name,
        cardExpirationMonth: cardData.expiry_month,
        cardExpirationYear: cardData.expiry_year,
        securityCode: cardData.cvv,
        identificationType: 'CPF',
        identificationNumber: '12345678901' // Em produção, use o CPF real
      });

      return token;
    } catch (error) {
      console.error('Error creating card token:', error);
      throw error;
    }
  }

  async getPaymentMethods(): Promise<any[]> {
    if (!this.mp) {
      throw new Error('Mercado Pago not initialized');
    }

    try {
      const paymentMethods = await this.mp.getPaymentMethods();
      return paymentMethods;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }

  async getInstallments(bin: string, amount: number): Promise<any[]> {
    if (!this.mp) {
      throw new Error('Mercado Pago not initialized');
    }

    try {
      const installments = await this.mp.getInstallments({ bin, amount });
      return installments;
    } catch (error) {
      console.error('Error getting installments:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.mp !== null && this.config !== null;
  }

  getConfig(): MercadoPagoConfig | null {
    return this.config;
  }

  // Utility function to format card number
  formatCardNumber(value: string): string {
    return value
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .substring(0, 19);
  }

  // Utility function to validate card number
  validateCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    return /^\d{13,19}$/.test(cleanNumber);
  }

  // Utility function to validate CVV
  validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  // Utility function to validate expiry date
  validateExpiryDate(month: string, year: string): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  }
}

export default new MercadoPagoService();
