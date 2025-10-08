import { createElement } from 'lwc';
import { ShowToastEventName } from 'lightning/platformShowToastEvent';
import OrderManagement from 'c/orderManagement';
import getOrders from '@salesforce/apex/OrderController.getOrders';
import deleteOrder from '@salesforce/apex/OrderController.deleteOrder';

// Mock Apex methods
jest.mock(
    '@salesforce/apex/OrderController.getOrders',
    () => {
        const { createApexTestWireAdapter } = require('@salesforce/sfdx-lwc-jest');
        return {
            default: createApexTestWireAdapter(jest.fn())
        };
    },
    { virtual: true }
);

jest.mock(
    '@salesforce/apex/OrderController.deleteOrder',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true }
);

// Mock data
const mockOrders = [
    {
        id: '001000000000001',
        orderNumber: 'ORD-2024-001',
        customerName: 'Test Customer 1',
        orderDate: '2024-01-01',
        status: 'Draft',
        totalAmount: 100.00
    },
    {
        id: '001000000000002',
        orderNumber: 'ORD-2024-002',
        customerName: 'Test Customer 2',
        orderDate: '2024-01-02',
        status: 'Confirmed',
        totalAmount: 200.00
    }
];

describe('c-order-management', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // Clear mocks
        jest.clearAllMocks();
    });

    it('renders correctly with orders', async () => {
        const element = createElement('c-order-management', {
            is: OrderManagement
        });
        document.body.appendChild(element);

        // Emit data from the wire
        getOrders.emit(mockOrders);

        await Promise.resolve();

        // Check if data table is rendered
        const dataTable = element.shadowRoot.querySelector('lightning-datatable');
        expect(dataTable).toBeTruthy();
        expect(dataTable.data).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: '001000000000001',
                orderNumber: 'ORD-2024-001'
            })
        ]));
    });

    it('displays no orders message when no data', async () => {
        const element = createElement('c-order-management', {
            is: OrderManagement
        });
        document.body.appendChild(element);

        // Emit empty data from the wire
        getOrders.emit([]);

        await Promise.resolve();

        // Check for no orders message
        const noOrdersMessage = element.shadowRoot.querySelector('h3');
        expect(noOrdersMessage.textContent).toBe('No Orders Found');
    });

    it('handles search functionality', async () => {
        const element = createElement('c-order-management', {
            is: OrderManagement
        });
        document.body.appendChild(element);

        // Emit data from the wire
        getOrders.emit(mockOrders);

        await Promise.resolve();

        // Simulate search input
        const searchInput = element.shadowRoot.querySelector('lightning-input[type="search"]');
        searchInput.value = 'Customer 1';
        searchInput.dispatchEvent(new CustomEvent('change', {
            detail: { value: 'Customer 1' }
        }));

        await Promise.resolve();

        // Check if filtered data is displayed
        const dataTable = element.shadowRoot.querySelector('lightning-datatable');
        expect(dataTable.data.length).toBe(1);
        expect(dataTable.data[0].customerName).toBe('Test Customer 1');
    });

    it('handles status filter', async () => {
        const element = createElement('c-order-management', {
            is: OrderManagement
        });
        document.body.appendChild(element);

        // Emit data from the wire
        getOrders.emit(mockOrders);

        await Promise.resolve();

        // Simulate status filter change
        const statusFilter = element.shadowRoot.querySelector('lightning-combobox');
        statusFilter.dispatchEvent(new CustomEvent('change', {
            detail: { value: 'Draft' }
        }));

        await Promise.resolve();

        // Check if filtered data is displayed
        const dataTable = element.shadowRoot.querySelector('lightning-datatable');
        expect(dataTable.data.length).toBe(1);
        expect(dataTable.data[0].status).toBe('Draft');
    });

    it('handles new order button click', async () => {
        const element = createElement('c-order-management', {
            is: OrderManagement
        });
        document.body.appendChild(element);

        await Promise.resolve();

        // Click new order button
        const newOrderButton = element.shadowRoot.querySelector('lightning-button[label="New Order"]');
        newOrderButton.click();

        await Promise.resolve();

        // Check if new order modal is shown
        expect(element.showNewOrderModal).toBe(true);
    });

    it('handles row actions', async () => {
        const element = createElement('c-order-management', {
            is: OrderManagement
        });
        document.body.appendChild(element);

        // Emit data from the wire
        getOrders.emit(mockOrders);

        await Promise.resolve();

        // Simulate row action
        const dataTable = element.shadowRoot.querySelector('lightning-datatable');
        dataTable.dispatchEvent(new CustomEvent('rowaction', {
            detail: {
                action: { name: 'view' },
                row: { id: '001000000000001' }
            }
        }));

        await Promise.resolve();

        // Check if order details modal is shown
        expect(element.showOrderDetails).toBe(true);
        expect(element.selectedOrderId).toBe('001000000000001');
    });

    it('handles delete order action', async () => {
        const element = createElement('c-order-management', {
            is: OrderManagement
        });
        document.body.appendChild(element);

        // Mock window.confirm
        global.confirm = jest.fn(() => true);

        // Emit data from the wire
        getOrders.emit(mockOrders);

        await Promise.resolve();

        // Mock successful delete
        deleteOrder.mockResolvedValue();

        // Simulate delete action
        const dataTable = element.shadowRoot.querySelector('lightning-datatable');
        dataTable.dispatchEvent(new CustomEvent('rowaction', {
            detail: {
                action: { name: 'delete' },
                row: { id: '001000000000001' }
            }
        }));

        await Promise.resolve();

        // Check if delete method was called
        expect(deleteOrder).toHaveBeenCalledWith({ orderId: '001000000000001' });
    });

    it('handles sorting', async () => {
        const element = createElement('c-order-management', {
            is: OrderManagement
        });
        document.body.appendChild(element);

        // Emit data from the wire
        getOrders.emit(mockOrders);

        await Promise.resolve();

        // Simulate sort event
        const dataTable = element.shadowRoot.querySelector('lightning-datatable');
        dataTable.dispatchEvent(new CustomEvent('sort', {
            detail: {
                fieldName: 'orderNumber',
                sortDirection: 'asc'
            }
        }));

        await Promise.resolve();

        // Check if sort properties are updated
        expect(element.sortBy).toBe('orderNumber');
        expect(element.sortDirection).toBe('asc');
    });

    it('shows toast on error', async () => {
        const element = createElement('c-order-management', {
            is: OrderManagement
        });
        document.body.appendChild(element);

        // Mock toast event handler
        const handler = jest.fn();
        element.addEventListener(ShowToastEventName, handler);

        // Emit error from the wire
        getOrders.error({ body: { message: 'Test error' } });

        await Promise.resolve();

        // Check if toast event was dispatched
        expect(handler).toHaveBeenCalled();
        expect(handler.mock.calls[0][0].detail.title).toBe('Error');
    });

    it('handles refresh functionality', async () => {
        const element = createElement('c-order-management', {
            is: OrderManagement
        });
        document.body.appendChild(element);

        await Promise.resolve();

        // Click refresh button
        const refreshButton = element.shadowRoot.querySelector('lightning-button[label="Refresh"]');
        refreshButton.click();

        await Promise.resolve();

        // Check if loading state is set
        expect(element.isLoading).toBe(false); // Should be false after refresh completes
    });

    it('calculates order count correctly', async () => {
        const element = createElement('c-order-management', {
            is: OrderManagement
        });
        document.body.appendChild(element);

        // Emit data from the wire
        getOrders.emit(mockOrders);

        await Promise.resolve();

        // Check order count
        expect(element.orderCount).toBe(2);

        // Apply filter and check count
        const searchInput = element.shadowRoot.querySelector('lightning-input[type="search"]');
        searchInput.value = 'Customer 1';
        searchInput.dispatchEvent(new CustomEvent('change', {
            detail: { value: 'Customer 1' }
        }));

        await Promise.resolve();

        expect(element.orderCount).toBe(1);
    });
});