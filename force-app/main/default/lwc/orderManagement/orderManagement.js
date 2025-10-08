import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getOrders from '@salesforce/apex/OrderController.getOrders';
import deleteOrder from '@salesforce/apex/OrderController.deleteOrder';

const COLUMNS = [
    {
        label: 'Order Number',
        fieldName: 'orderNumber',
        type: 'text',
        sortable: true
    },
    {
        label: 'Customer',
        fieldName: 'customerName',
        type: 'text',
        sortable: true
    },
    {
        label: 'Order Date',
        fieldName: 'orderDate',
        type: 'date',
        sortable: true
    },
    {
        label: 'Status',
        fieldName: 'status',
        type: 'text',
        sortable: true,
        cellAttributes: {
            class: { fieldName: 'statusClass' }
        }
    },
    {
        label: 'Total Amount',
        fieldName: 'totalAmount',
        type: 'currency',
        sortable: true
    },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [
                { label: 'View', name: 'view' },
                { label: 'Edit', name: 'edit' },
                { label: 'Delete', name: 'delete' }
            ]
        }
    }
];

export default class OrderManagement extends LightningElement {
    @track orders = [];
    @track filteredOrders = [];
    @track selectedOrderId = null;
    @track isLoading = false;
    @track showOrderDetails = false;
    @track showNewOrderModal = false;
    @track searchTerm = '';
    @track selectedStatus = 'All';
    @track sortBy = 'orderDate';
    @track sortDirection = 'desc';

    columns = COLUMNS;

    statusOptions = [
        { label: 'All', value: 'All' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Processing', value: 'Processing' },
        { label: 'Shipped', value: 'Shipped' },
        { label: 'Delivered', value: 'Delivered' },
        { label: 'Cancelled', value: 'Cancelled' }
    ];

    @wire(getOrders)
    wiredOrders(result) {
        this.wiredOrdersResult = result;
        if (result.data) {
            this.orders = result.data.map(order => ({
                ...order,
                statusClass: this.getStatusClass(order.status)
            }));
            this.filterOrders();
        } else if (result.error) {
            this.showToast('Error', 'Failed to load orders', 'error');
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'Draft': return 'slds-text-color_weak';
            case 'Confirmed': return 'slds-text-color_success';
            case 'Processing': return 'slds-text-color_default';
            case 'Shipped': return 'slds-text-color_brand';
            case 'Delivered': return 'slds-text-color_success';
            case 'Cancelled': return 'slds-text-color_error';
            default: return 'slds-text-color_default';
        }
    }

    handleSearch(event) {
        this.searchTerm = event.target.value.toLowerCase();
        this.filterOrders();
    }

    handleStatusFilter(event) {
        this.selectedStatus = event.detail.value;
        this.filterOrders();
    }

    filterOrders() {
        let filtered = [...this.orders];

        // Filter by search term
        if (this.searchTerm) {
            filtered = filtered.filter(order => 
                order.orderNumber.toLowerCase().includes(this.searchTerm) ||
                order.customerName.toLowerCase().includes(this.searchTerm)
            );
        }

        // Filter by status
        if (this.selectedStatus !== 'All') {
            filtered = filtered.filter(order => order.status === this.selectedStatus);
        }

        // Sort orders
        filtered.sort((a, b) => {
            let aVal = a[this.sortBy];
            let bVal = b[this.sortBy];
            
            if (this.sortBy === 'orderDate') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.filteredOrders = filtered;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        
        switch (actionName) {
            case 'view':
                this.viewOrder(row.id);
                break;
            case 'edit':
                this.editOrder(row.id);
                break;
            case 'delete':
                this.deleteOrderRecord(row.id);
                break;
        }
    }

    handleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.filterOrders();
    }

    viewOrder(orderId) {
        this.selectedOrderId = orderId;
        this.showOrderDetails = true;
    }

    editOrder(orderId) {
        this.selectedOrderId = orderId;
        this.showOrderDetails = true;
    }

    async deleteOrderRecord(orderId) {
        if (confirm('Are you sure you want to delete this order?')) {
            this.isLoading = true;
            try {
                await deleteOrder({ orderId });
                this.showToast('Success', 'Order deleted successfully', 'success');
                await refreshApex(this.wiredOrdersResult);
            } catch (error) {
                this.showToast('Error', 'Failed to delete order: ' + error.body.message, 'error');
            } finally {
                this.isLoading = false;
            }
        }
    }

    handleNewOrder() {
        this.selectedOrderId = null;
        this.showNewOrderModal = true;
    }

    handleCloseOrderDetails() {
        this.showOrderDetails = false;
        this.selectedOrderId = null;
    }

    handleCloseNewOrder() {
        this.showNewOrderModal = false;
    }

    handleOrderSaved() {
        this.showOrderDetails = false;
        this.showNewOrderModal = false;
        this.selectedOrderId = null;
        refreshApex(this.wiredOrdersResult);
        this.showToast('Success', 'Order saved successfully', 'success');
    }

    handleRefresh() {
        this.isLoading = true;
        refreshApex(this.wiredOrdersResult).finally(() => {
            this.isLoading = false;
        });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }

    get hasOrders() {
        return this.filteredOrders && this.filteredOrders.length > 0;
    }

    get orderCount() {
        return this.filteredOrders ? this.filteredOrders.length : 0;
    }
}