import { createElement } from 'lwc';
import { ShowToastEventName } from 'lightning/platformShowToastEvent';
import OrderItemSelector from 'c/orderItemSelector';

// Mock data
const mockProducts = [
    {
        Id: '001000000000001',
        Name: 'Test Product 1',
        ProductCode__c: 'PROD-001',
        Description__c: 'Test product 1 description',
        UnitPrice__c: 50.00
    },
    {
        Id: '001000000000002',
        Name: 'Test Product 2',
        ProductCode__c: 'PROD-002',
        Description__c: 'Test product 2 description',
        UnitPrice__c: 75.00
    },
    {
        Id: '001000000000003',
        Name: 'Another Product',
        ProductCode__c: 'PROD-003',
        Description__c: 'Another product description',
        UnitPrice__c: 100.00
    }
];

describe('c-order-item-selector', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders correctly with products', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        await Promise.resolve();

        // Check if products are displayed
        const productItems = element.shadowRoot.querySelectorAll('.product-item');
        expect(productItems.length).toBe(3);
    });

    it('handles product search', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        await Promise.resolve();

        // Simulate search input
        const searchInput = element.shadowRoot.querySelector('lightning-input[type="search"]');
        searchInput.value = 'Another';
        searchInput.dispatchEvent(new CustomEvent('change', {
            detail: { value: 'Another' }
        }));

        await Promise.resolve();

        // Check if filtered products are displayed
        expect(element.filteredProducts.length).toBe(1);
        expect(element.filteredProducts[0].Name).toBe('Another Product');
    });

    it('handles product selection', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        await Promise.resolve();

        // Simulate product selection
        const productItem = element.shadowRoot.querySelector('.product-item[data-product-id="001000000000001"]');
        productItem.click();

        await Promise.resolve();

        // Check if product is selected
        expect(element.selectedProduct).toEqual(mockProducts[0]);
        expect(element.unitPrice).toBe(50.00);
    });

    it('handles quantity change', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        // Select a product first
        element.selectedProduct = mockProducts[0];
        element.unitPrice = 50.00;

        await Promise.resolve();

        // Simulate quantity change
        const quantityInput = element.shadowRoot.querySelector('lightning-input[label="Quantity"]');
        quantityInput.value = '3';
        quantityInput.dispatchEvent(new CustomEvent('change', {
            detail: { value: '3' }
        }));

        await Promise.resolve();

        // Check if quantity is updated
        expect(element.quantity).toBe(3);
        expect(element.lineTotal).toBe(150.00);
    });

    it('handles unit price change', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        // Select a product first
        element.selectedProduct = mockProducts[0];
        element.quantity = 2;

        await Promise.resolve();

        // Simulate unit price change
        const priceInput = element.shadowRoot.querySelector('lightning-input[label="Unit Price"]');
        priceInput.value = '60.00';
        priceInput.dispatchEvent(new CustomEvent('change', {
            detail: { value: '60.00' }
        }));

        await Promise.resolve();

        // Check if unit price is updated
        expect(element.unitPrice).toBe(60.00);
        expect(element.lineTotal).toBe(120.00);
    });

    it('validates required fields before adding item', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        // Mock toast event handler
        const handler = jest.fn();
        element.addEventListener(ShowToastEventName, handler);

        await Promise.resolve();

        // Try to add item without selecting product
        const addButton = element.shadowRoot.querySelector('lightning-button[label="Add Item"]');
        addButton.click();

        await Promise.resolve();

        // Check if validation error toast was shown
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe('Error');
        expect(handler.mock.calls[0][0].detail.message).toBe('Please select a product');
    });

    it('validates quantity before adding item', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        // Mock toast event handler
        const handler = jest.fn();
        element.addEventListener(ShowToastEventName, handler);

        // Select a product but set invalid quantity
        element.selectedProduct = mockProducts[0];
        element.quantity = 0;

        await Promise.resolve();

        // Try to add item with invalid quantity
        const addButton = element.shadowRoot.querySelector('lightning-button[label="Add Item"]');
        addButton.click();

        await Promise.resolve();

        // Check if validation error toast was shown
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.message).toBe('Quantity must be greater than 0');
    });

    it('validates unit price before adding item', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        // Mock toast event handler
        const handler = jest.fn();
        element.addEventListener(ShowToastEventName, handler);

        // Select a product but set negative price
        element.selectedProduct = mockProducts[0];
        element.quantity = 1;
        element.unitPrice = -10.00;

        await Promise.resolve();

        // Try to add item with negative price
        const addButton = element.shadowRoot.querySelector('lightning-button[label="Add Item"]');
        addButton.click();

        await Promise.resolve();

        // Check if validation error toast was shown
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.message).toBe('Unit price cannot be negative');
    });

    it('successfully adds item with valid data', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        // Mock itemadded event handler
        const handler = jest.fn();
        element.addEventListener('itemadded', handler);

        // Set valid data
        element.selectedProduct = mockProducts[0];
        element.quantity = 2;
        element.unitPrice = 50.00;

        await Promise.resolve();

        // Add item
        const addButton = element.shadowRoot.querySelector('lightning-button[label="Add Item"]');
        addButton.click();

        await Promise.resolve();

        // Check if itemadded event was dispatched with correct data
        expect(handler).toHaveBeenCalled();
        const eventDetail = handler.mock.calls[0][0].detail;
        expect(eventDetail.Product__c).toBe('001000000000001');
        expect(eventDetail.ProductName__c).toBe('Test Product 1');
        expect(eventDetail.Quantity__c).toBe(2);
        expect(eventDetail.UnitPrice__c).toBe(50.00);
        expect(eventDetail.LineTotal__c).toBe(100.00);
    });

    it('handles clear product selection', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        // Select a product first
        element.selectedProduct = mockProducts[0];
        element.unitPrice = 50.00;

        await Promise.resolve();

        // Clear selection
        const clearButton = element.shadowRoot.querySelector('lightning-button-icon[title="Clear selection"]');
        clearButton.click();

        await Promise.resolve();

        // Check if selection is cleared
        expect(element.selectedProduct).toBeNull();
        expect(element.unitPrice).toBe(0);
    });

    it('handles close event', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        // Mock close event handler
        const handler = jest.fn();
        element.addEventListener('close', handler);

        await Promise.resolve();

        // Click close button
        const closeButton = element.shadowRoot.querySelector('lightning-button[label="Cancel"]');
        closeButton.click();

        await Promise.resolve();

        // Check if close event was dispatched
        expect(handler).toHaveBeenCalled();
    });

    it('displays no products message when no products match search', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        await Promise.resolve();

        // Search for non-existent product
        const searchInput = element.shadowRoot.querySelector('lightning-input[type="search"]');
        searchInput.value = 'NonExistentProduct';
        searchInput.dispatchEvent(new CustomEvent('change', {
            detail: { value: 'NonExistentProduct' }
        }));

        await Promise.resolve();

        // Check if no products message is displayed
        expect(element.hasProducts).toBe(false);
        const noProductsMessage = element.shadowRoot.querySelector('h3');
        expect(noProductsMessage.textContent).toBe('No Products Found');
    });

    it('calculates line total correctly', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        // Set quantity and unit price
        element.quantity = 5;
        element.unitPrice = 25.50;

        await Promise.resolve();

        // Check line total calculation
        expect(element.lineTotal).toBe(127.50);
        expect(element.formattedLineTotal).toBe('$127.50');
    });

    it('disables add button when no product selected', async () => {
        const element = createElement('c-order-item-selector', {
            is: OrderItemSelector
        });
        element.products = mockProducts;

        document.body.appendChild(element);

        await Promise.resolve();

        // Check if add button is disabled
        expect(element.isAddDisabled).toBe(true);

        // Select a product
        element.selectedProduct = mockProducts[0];
        element.quantity = 1;

        await Promise.resolve();

        // Check if add button is enabled
        expect(element.isAddDisabled).toBe(false);
    });
});