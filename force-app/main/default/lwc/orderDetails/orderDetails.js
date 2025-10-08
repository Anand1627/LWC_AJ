import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, updateRecord, createRecord } from 'lightning/uiRecordApi';
import getOrderById from '@salesforce/apex/OrderController.getOrderById';
import saveOrder from '@salesforce/apex/OrderController.saveOrder';
import getCustomers from '@salesforce/apex/OrderController.getCustomers';
import getProducts from '@salesforce/apex/OrderController.getProducts';

const ORDER_FIELDS = [
    'Order__c.Id',
    'Order__c.OrderNumber__c',
    'Order__c.Customer__c',
    'Order__c.OrderDate__c',
    'Order__c.Status__c',
    'Order__c.TotalAmount__c',
    'Order__c.ShippingAddress__c',
    'Order__c.BillingAddress__c',
    'Order__c.Notes__c'
];

export default class OrderDetails extends LightningElement {
    @api orderId;
    @track order = {};
    @track orderItems = [];
    @track customers = [];
    @track products = [];
    @track isLoading = false;
    @track isEditMode = false;
    @track showAddItemModal = false;

    statusOptions = [
        { label: 'Draft', value: 'Draft' },
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Processing', value: 'Processing' },
        { label: 'Shipped', value: 'Shipped' },
        { label: 'Delivered', value: 'Delivered' },
        { label: 'Cancelled', value: 'Cancelled' }
    ];

    connectedCallback() {
        this.loadData();
    }

    async loadData() {
        this.isLoading = true;
        try {
            // Load customers and products in parallel
            const [customersResult, productsResult] = await Promise.all([
                getCustomers(),
                getProducts()
            ]);
            
            this.customers = customersResult.map(customer => ({
                label: customer.Name,
                value: customer.Id
            }));
            
            this.products = productsResult;

            // Load order if editing existing order
            if (this.orderId) {
                const orderResult = await getOrderById({ orderId: this.orderId });
                this.order = orderResult.order;
                this.orderItems = orderResult.orderItems || [];
                this.isEditMode = false;
            } else {
                // Initialize new order
                this.order = {
                    OrderNumber__c: this.generateOrderNumber(),
                    OrderDate__c: new Date().toISOString().split('T')[0],
                    Status__c: 'Draft',
                    TotalAmount__c: 0
                };
                this.orderItems = [];
                this.isEditMode = true;
            }
        } catch (error) {
            this.showToast('Error', 'Failed to load data: ' + error.body?.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    generateOrderNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const time = String(now.getTime()).slice(-4);
        return `ORD-${year}${month}${day}-${time}`;
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;
        
        this.order = {
            ...this.order,
            [field]: value
        };

        // Recalculate total if needed
        if (field === 'Status__c' || this.orderItems.length > 0) {
            this.calculateTotal();
        }
    }

    handleEdit() {
        this.isEditMode = true;
    }

    handleCancel() {
        if (this.orderId) {
            this.isEditMode = false;
            this.loadData(); // Reload original data
        } else {
            this.handleClose();
        }
    }

    async handleSave() {
        if (!this.validateOrder()) {
            return;
        }

        this.isLoading = true;
        try {
            const orderData = {
                ...this.order,
                orderItems: this.orderItems
            };

            const result = await saveOrder({ 
                orderData: JSON.stringify(orderData),
                orderId: this.orderId 
            });

            this.orderId = result.orderId;
            this.order = result.order;
            this.orderItems = result.orderItems || [];
            this.isEditMode = false;

            this.showToast('Success', 'Order saved successfully', 'success');
            this.dispatchEvent(new CustomEvent('save', {
                detail: { orderId: this.orderId }
            }));
        } catch (error) {
            this.showToast('Error', 'Failed to save order: ' + error.body?.message, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    validateOrder() {
        const requiredFields = ['Customer__c', 'OrderDate__c', 'Status__c'];
        
        for (let field of requiredFields) {
            if (!this.order[field]) {
                this.showToast('Error', `Please fill in all required fields`, 'error');
                return false;
            }
        }

        if (this.orderItems.length === 0) {
            this.showToast('Warning', 'Order has no items. Add at least one item.', 'warning');
        }

        return true;
    }

    handleAddItem() {
        this.showAddItemModal = true;
    }

    handleCloseAddItem() {
        this.showAddItemModal = false;
    }

    handleItemAdded(event) {
        const newItem = event.detail;
        this.orderItems = [...this.orderItems, {
            ...newItem,
            Id: 'temp_' + Date.now(),
            isNew: true
        }];
        this.calculateTotal();
        this.showAddItemModal = false;
    }

    handleRemoveItem(event) {
        const itemId = event.target.dataset.itemId;
        this.orderItems = this.orderItems.filter(item => item.Id !== itemId);
        this.calculateTotal();
    }

    handleItemQuantityChange(event) {
        const itemId = event.target.dataset.itemId;
        const quantity = parseInt(event.target.value);
        
        this.orderItems = this.orderItems.map(item => {
            if (item.Id === itemId) {
                const updatedItem = { ...item, Quantity__c: quantity };
                updatedItem.LineTotal__c = quantity * item.UnitPrice__c;
                return updatedItem;
            }
            return item;
        });
        
        this.calculateTotal();
    }

    calculateTotal() {
        const total = this.orderItems.reduce((sum, item) => {
            return sum + (item.LineTotal__c || 0);
        }, 0);
        
        this.order = {
            ...this.order,
            TotalAmount__c: total
        };
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

    get isNewOrder() {
        return !this.orderId;
    }

    get modalTitle() {
        return this.isNewOrder ? 'New Order' : `Order ${this.order.OrderNumber__c || ''}`;
    }

    get selectedCustomer() {
        return this.order.Customer__c;
    }

    get hasItems() {
        return this.orderItems && this.orderItems.length > 0;
    }

    get formattedTotal() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(this.order.TotalAmount__c || 0);
    }

    get statusClass() {
        const status = this.order.Status__c;
        switch (status) {
            case 'Draft': return 'slds-badge slds-theme_default';
            case 'Confirmed': return 'slds-badge slds-theme_success';
            case 'Processing': return 'slds-badge slds-theme_info';
            case 'Shipped': return 'slds-badge slds-theme_warning';
            case 'Delivered': return 'slds-badge slds-theme_success';
            case 'Cancelled': return 'slds-badge slds-theme_error';
            default: return 'slds-badge slds-theme_default';
        }
    }
}