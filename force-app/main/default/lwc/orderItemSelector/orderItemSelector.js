import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class OrderItemSelector extends LightningElement {
    @api products = [];
    @track selectedProduct = null;
    @track quantity = 1;
    @track unitPrice = 0;
    @track searchTerm = '';
    @track filteredProducts = [];

    connectedCallback() {
        this.filteredProducts = [...this.products];
    }

    handleSearch(event) {
        this.searchTerm = event.target.value.toLowerCase();
        this.filterProducts();
    }

    filterProducts() {
        if (this.searchTerm) {
            this.filteredProducts = this.products.filter(product =>
                product.Name.toLowerCase().includes(this.searchTerm) ||
                product.ProductCode__c?.toLowerCase().includes(this.searchTerm) ||
                product.Description__c?.toLowerCase().includes(this.searchTerm)
            );
        } else {
            this.filteredProducts = [...this.products];
        }
    }

    handleProductSelect(event) {
        const productId = event.currentTarget.dataset.productId;
        const product = this.products.find(p => p.Id === productId);
        
        if (product) {
            this.selectedProduct = product;
            this.unitPrice = product.UnitPrice__c || 0;
            
            // Close the product list
            this.template.querySelector('.product-list').classList.add('slds-hide');
        }
    }

    handleQuantityChange(event) {
        this.quantity = parseInt(event.target.value) || 1;
    }

    handleUnitPriceChange(event) {
        this.unitPrice = parseFloat(event.target.value) || 0;
    }

    handleClearProduct() {
        this.selectedProduct = null;
        this.unitPrice = 0;
        this.template.querySelector('.product-list').classList.remove('slds-hide');
    }

    handleAddItem() {
        if (!this.selectedProduct) {
            this.showToast('Error', 'Please select a product', 'error');
            return;
        }

        if (this.quantity <= 0) {
            this.showToast('Error', 'Quantity must be greater than 0', 'error');
            return;
        }

        if (this.unitPrice < 0) {
            this.showToast('Error', 'Unit price cannot be negative', 'error');
            return;
        }

        const orderItem = {
            Product__c: this.selectedProduct.Id,
            ProductName__c: this.selectedProduct.Name,
            ProductCode__c: this.selectedProduct.ProductCode__c,
            Quantity__c: this.quantity,
            UnitPrice__c: this.unitPrice,
            LineTotal__c: this.quantity * this.unitPrice,
            Description__c: this.selectedProduct.Description__c
        };

        this.dispatchEvent(new CustomEvent('itemadded', {
            detail: orderItem
        }));
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }

    get hasProducts() {
        return this.filteredProducts && this.filteredProducts.length > 0;
    }

    get lineTotal() {
        return this.quantity * this.unitPrice;
    }

    get formattedLineTotal() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.lineTotal);
    }

    get isAddDisabled() {
        return !this.selectedProduct || this.quantity <= 0;
    }

    get productDisplayName() {
        if (!this.selectedProduct) return '';
        return `${this.selectedProduct.Name} ${this.selectedProduct.ProductCode__c ? '(' + this.selectedProduct.ProductCode__c + ')' : ''}`;
    }
}