import { EVMMintInstructions, MintInstructionType, MintTemplate, SolanaMintInstructions } from '../types/mint-template';

export class MintTemplateBuilder {
  private mintTemplate: any;

  constructor(predefinedTemplate: MintTemplate | undefined = undefined) {
    if (predefinedTemplate) {
      this.mintTemplate = predefinedTemplate;
    } else {
      this.mintTemplate = {
        name: null,
        featuredImageUrl: null,
        images: [],
        originalUrl: null,
        mintInstructionType: null,
        mintInstructions: null,
        liveDate: null,
        availableForPurchaseStart: null,
        availableForPurchaseEnd: null,
        partnerName: null,
        promotionaltext: null,
      };
    }
  }

  build(): MintTemplate {
    this.validateMintTemplate();
    return this.mintTemplate;
  }

  validateMintTemplate() {
    if (!this.mintTemplate.name) {
      throw new Error('MintTemplate name is required');
    }
    if (!this.mintTemplate.featuredImageUrl) {
      throw new Error('MintTemplate featuredImageUrl is required');
    }
    if (!this.mintTemplate.originalUrl) {
      throw new Error('MintTemplate originalUrl is required');
    }
    if (!this.mintTemplate.mintInstructionType) {
      throw new Error('MintTemplate mintInstructionType is required');
    }
    if (!this.mintTemplate.mintInstructions) {
      throw new Error('MintTemplate mintInstructions is required');
    }
    if (!this.mintTemplate.liveDate) {
      throw new Error('MintTemplate liveDate is required');
    }
    if (!this.mintTemplate.availableForPurchaseStart) {
      throw new Error('MintTemplate availableForPurchaseStart is required');
    }
    if (!this.mintTemplate.availableForPurchaseEnd) {
      throw new Error('MintTemplate availableForPurchaseEnd is required');
    }
    if (!this.mintTemplate.partnerName) {
      throw new Error('MintTemplate partnerName is required');
    }
  }

  /* Setters */

  setName(name: string) {
    this.mintTemplate.name = name;
    return this;
  }

  setDescription(description: string) {
    this.mintTemplate.description = description;
    return this;
  }

  setFeaturedImageUrl(featuredImageUrl: string) {
    this.mintTemplate.featuredImageUrl = featuredImageUrl;
    return this;
  }

  addImage(url: string, caption: string | null) {
    this.mintTemplate.images.push({ url, caption });
    return this;
  }

  setOriginalUrl(originalUrl: string) {
    this.mintTemplate.originalUrl = originalUrl;
    return this;
  }

  setMintInstructionType(mintInstructionType: MintInstructionType) {
    this.mintTemplate.mintInstructionType = mintInstructionType;
    return this;
  }

  setMintInstructions(mintInstructions: EVMMintInstructions | SolanaMintInstructions) {
    this.mintTemplate.mintInstructions = mintInstructions;
    return this;
  }

  setLiveDate(liveDate: Date) {
    this.mintTemplate.liveDate = liveDate;
    return this;
  }

  setAvailableForPurchaseStart(availableForPurchaseStart: Date) {
    this.mintTemplate.availableForPurchaseStart = availableForPurchaseStart;
    return this;
  }

  setAvailableForPurchaseEnd(availableForPurchaseEnd: Date) {
    this.mintTemplate.availableForPurchaseEnd = availableForPurchaseEnd;
    return this;
  }

  setPartnerName(partnerName: string) {
    this.mintTemplate.partnerName = partnerName;
    return this;
  }

  setPromotionalText(promotionaltext: string) {
    this.mintTemplate.promotionaltext = promotionaltext;
    return this;
  }

  /* Unsetters */

  unsetPromotionalText() {
    this.mintTemplate.promotionaltext = null;
    return this;
  }

  unsetPartnerName() {
    this.mintTemplate.partnerName = null;
    return this;
  }

  unsetAvailableForPurchaseEnd() {
    this.mintTemplate.availableForPurchaseEnd = null;
    return this;
  }

  unsetAvailableForPurchaseStart() {
    this.mintTemplate.availableForPurchaseStart = null;
    return this;
  }

  unsetLiveDate() {
    this.mintTemplate.liveDate = null;
    return this;
  }

  unsetMintInstructions() {
    this.mintTemplate.mintInstructions = null;
    return this;
  }

  unsetMintInstructionType() {
    this.mintTemplate.mintInstructionType = null;
    return this;
  }

  unsetOriginalUrl() {
    this.mintTemplate.originalUrl = null;
    return this;
  }

  unsetFeaturedImageUrl() {
    this.mintTemplate.featuredImageUrl = null;
    return this;
  }

  unsetName() {
    this.mintTemplate.name = null;
    return this;
  }

  unsetDescription() {
    this.mintTemplate.description = null;
    return this;
  }

  unsetImages() {
    this.mintTemplate.images = [];
    return this;
  }
}
