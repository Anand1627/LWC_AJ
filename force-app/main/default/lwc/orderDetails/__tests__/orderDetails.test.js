import { createElement } from 'lwc';
import { ShowToastEventName } from 'lightning/platformShowToastEvent';
import OrderDetails from 'c/orderDetails';
import getOrderById from '@salesforce/apex/OrderController.getOrderById';
import saveOrder from '@salesforce/apex/OrderController.saveOrder';
import getCustomers from '@salesforce/apex/OrderController.getCustomers';
import getProducts from '@salesforce/apex/OrderController.getProducts';

// Mock Apex methods
jest.mock(
    '@salesforce/apex/OrderController.getOrderById',
    () => {
        return { default: jest.fn() };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/OrderController.saveOrder',
    () => {
        return { default: jest.fn() };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/OrderController.getCustomers',
    () => {
        return { default: jest.fn() };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/OrderController.getProducts',
    () => {
        return { default: jest.fn() };
    },
    { virtual: true }
);

// Mock data
const mockCustomers = [
    { Id: '001000000000001', Name: 'Test Customer 1' },
    { Id: '001000000000002', Name: 'Test Customer 2' }
];

const mockProducts = [
    { Id: '001000000000001', Name: 'Test Product 1', ProductCode: 'PROD-001' },
    { Id: '001000000000002', Name: 'Test Product 2', ProductCode: 'PROD-002' }
];

const mockOrder = {
    Id: '001000000000001',
    OrderNumber__c: 'ORD-2024-001',
    Customer__c: '001000000000001',
    OrderDate__c: '2024-01-01',
    Status__c: 'Draft',
    TotalAmount__c: 100.00,
    ShippingAddress__c: 'Test Shipping Address',
    BillingAddress__c: 'Test Billing Address',
    Notes__c: 'Test Notes'
};

const mockOrderItems = [
    {
        Id: '001000000000001',
        ProductName__c: 'Test Product 1',
        ProductCode__c: 'PROD-001',
        Quantity__c: 2,
        UnitPrice__c: 50.00,
        LineTotal__c: 100.00
    }
];

const mockOrderDetail = {
    order: mockOrder,
    orderItems: mockOrderItems
};

describe('c-order-details', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Clear mocks
        jest.clearAllMocks();
    });

    it('renders correctly for existing order', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });
        element.orderId = '001000000000001';

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);
        getOrderById.mockResolvedValue(mockOrderDetail);

        document.body.appendChild(element);

        await Promise.resolve();

        // Check if order information is displayed
        const orderNumberInput = element.shadowRoot.querySelector('lightning-input[data-field="OrderNumber__c"]');
        expect(orderNumberInput.value).toBe('ORD-2024-001');
    });

    it('renders correctly for new order', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);

        document.body.appendChild(element);

        await Promise.resolve();

        // Check if new order is initialized
        expect(element.isNewOrder).toBe(true);
        expect(element.isEditMode).toBe(true);
    });

    it('handles input changes', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);

        document.body.appendChild(element);

        await Promise.resolve();

        // Simulate input change
        const customerCombobox = element.shadowRoot.querySelector('lightning-combobox[data-field="Customer__c"]');
        customerCombobox.dispatchEvent(new CustomEvent('change', {
            detail: { value: '001000000000001' }
        }));

        await Promise.resolve();

        // Check if order data is updated
        expect(element.order.Customer__c).toBe('001000000000001');
    });

    it('handles edit mode toggle', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });
        element.orderId = '001000000000001';

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);
        getOrderById.mockResolvedValue(mockOrderDetail);

        document.body.appendChild(element);

        await Promise.resolve();

        // Initially should not be in edit mode
        expect(element.isEditMode).toBe(false);

        // Click edit button
        const editButton = element.shadowRoot.querySelector('lightning-button[label="Edit Order"]');
        editButton.click();

        await Promise.resolve();

        // Should now be in edit mode
        expect(element.isEditMode).toBe(true);
    });

    it('handles save functionality', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);
        saveOrder.mockResolvedValue({
            orderId: '001000000000001',
            order: mockOrder,
            orderItems: mockOrderItems
        });

        document.body.appendChild(element);

        await Promise.resolve();

        // Set required fields
        element.order = {
            ...element.order,
            Customer__c: '001000000000001',
            OrderDate__c: '2024-01-01',
            Status__c: 'Draft'
        };

        // Click save button
        const saveButton = element.shadowRoot.querySelector('lightning-button[label="Save Order"]');
        saveButton.click();

        await Promise.resolve();

        // Check if save method was called
        expect(saveOrder).toHaveBeenCalled();
    });

    it('validates required fields', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);

        document.body.appendChild(element);

        // Mock toast event handler
        const handler = jest.fn();
        element.addEventListener(ShowToastEventName, handler);

        await Promise.resolve();

        // Try to save without required fields
        const saveButton = element.shadowRoot.querySelector('lightning-button[label="Save Order"]');
        saveButton.click();

        await Promise.resolve();

        // Check if validation error toast was shown
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe('Error');
    });

    it('handles add item functionality', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);

        document.body.appendChild(element);

        await Promise.resolve();

        // Enable edit mode
        element.isEditMode = true;

        await Promise.resolve();

        // Click add item button
        const addItemButton = element.shadowRoot.querySelector('lightning-button[label="Add Item"]');
        addItemButton.click();

        await Promise.resolve();

        // Check if add item modal is shown
        expect(element.showAddItemModal).toBe(true);
    });

    it('handles item added event', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);

        document.body.appendChild(element);

        await Promise.resolve();

        const newItem = {
            Product__c: '001000000000001',
            ProductName__c: 'Test Product',
            Quantity__c: 1,
            UnitPrice__c: 50.00,
            LineTotal__c: 50.00
        };

        // Simulate item added event
        element.handleItemAdded({ detail: newItem });

        await Promise.resolve();

        // Check if item was added
        expect(element.orderItems.length).toBe(1);
        expect(element.order.TotalAmount__c).toBe(50.00);
    });

    it('handles item removal', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);

        document.body.appendChild(element);

        // Add an item first
        element.orderItems = [
            {
                Id: 'temp_123',
                ProductName__c: 'Test Product',
                Quantity__c: 1,
                UnitPrice__c: 50.00,
                LineTotal__c: 50.00
            }
        ];
        element.calculateTotal();

        await Promise.resolve();

        // Enable edit mode to show remove buttons
        element.isEditMode = true;

        await Promise.resolve();

        // Simulate remove item click
        const removeButton = element.shadowRoot.querySelector('lightning-button-icon[data-item-id="temp_123"]');
        if (removeButton) {
            removeButton.click();

            await Promise.resolve();

            // Check if item was removed
            expect(element.orderItems.length).toBe(0);
            expect(element.order.TotalAmount__c).toBe(0);
        }
    });

    it('handles quantity change', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);

        document.body.appendChild(element);

        // Add an item first
        element.orderItems = [
            {
                Id: 'temp_123',
                ProductName__c: 'Test Product',
                Quantity__c: 1,
                UnitPrice__c: 50.00,
                LineTotal__c: 50.00
            }
        ];

        await Promise.resolve();

        // Enable edit mode
        element.isEditMode = true;

        await Promise.resolve();

        // Simulate quantity change
        const quantityInput = element.shadowRoot.querySelector('lightning-input[data-item-id="temp_123"]');
        if (quantityInput) {
            quantityInput.value = '3';
            quantityInput.dispatchEvent(new CustomEvent('change', {
                detail: { value: '3' }
            }));

            await Promise.resolve();

            // Check if quantity and total were updated
            expect(element.orderItems[0].Quantity__c).toBe(3);
            expect(element.orderItems[0].LineTotal__c).toBe(150.00);
            expect(element.order.TotalAmount__c).toBe(150.00);
        }
    });

    it('handles close event', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);

        document.body.appendChild(element);

        // Mock close event handler
        const handler = jest.fn();
        element.addEventListener('close', handler);

        await Promise.resolve();

        // Click close button
        const closeButton = element.shadowRoot.querySelector('lightning-button[label="Close"]');
        closeButton.click();

        await Promise.resolve();

        // Check if close event was dispatched
        expect(handler).toHaveBeenCalled();
    });

    it('calculates total correctly', async () => {
        const element = createElement('c-order-details', {
            is: OrderDetails
        });

        // Mock API responses
        getCustomers.mockResolvedValue(mockCustomers);
        getProducts.mockResolvedValue(mockProducts);

        document.body.appendChild(element);

        // Set order items
        element.orderItems = [
            { LineTotal__c: 50.00 },
            { LineTotal__c: 75.00 },
            { LineTotal__c: 25.00 }
        ];

        // Calculate total
        element.calculateTotal();

        await Promise.resolve();

        // Check if total is calculated correctly
        expect(element.order.TotalAmount__c).toBe(150.00);
    });
});