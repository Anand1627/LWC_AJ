/**
 * @description Controller class for Order Management functionality
 * @author System Administrator
 * @date 2024
 */
public with sharing class OrderController {
    
    /**
     * @description Retrieves all orders with customer information
     * @return List of OrderWrapper objects containing order and customer data
     */
    @AuraEnabled(cacheable=true)
    public static List<OrderWrapper> getOrders() {
        try {
            List<Order__c> orders = [
                SELECT Id, OrderNumber__c, Customer__c, Customer__r.Name, OrderDate__c, 
                       Status__c, TotalAmount__c, ShippingAddress__c, BillingAddress__c, Notes__c,
                       CreatedDate, LastModifiedDate
                FROM Order__c 
                ORDER BY CreatedDate DESC
                LIMIT 1000
            ];
            
            List<OrderWrapper> orderWrappers = new List<OrderWrapper>();
            for (Order__c order : orders) {
                OrderWrapper wrapper = new OrderWrapper();
                wrapper.id = order.Id;
                wrapper.orderNumber = order.OrderNumber__c;
                wrapper.customerName = order.Customer__r?.Name;
                wrapper.orderDate = order.OrderDate__c;
                wrapper.status = order.Status__c;
                wrapper.totalAmount = order.TotalAmount__c;
                wrapper.shippingAddress = order.ShippingAddress__c;
                wrapper.billingAddress = order.BillingAddress__c;
                wrapper.notes = order.Notes__c;
                orderWrappers.add(wrapper);
            }
            
            return orderWrappers;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving orders: ' + e.getMessage());
        }
    }
    
    /**
     * @description Retrieves a specific order by ID with its order items
     * @param orderId The ID of the order to retrieve
     * @return OrderDetailWrapper containing order and order items
     */
    @AuraEnabled
    public static OrderDetailWrapper getOrderById(Id orderId) {
        try {
            Order__c order = [
                SELECT Id, OrderNumber__c, Customer__c, OrderDate__c, Status__c, 
                       TotalAmount__c, ShippingAddress__c, BillingAddress__c, Notes__c
                FROM Order__c 
                WHERE Id = :orderId
                LIMIT 1
            ];
            
            List<OrderItem__c> orderItems = [
                SELECT Id, Product__c, ProductName__c, ProductCode__c, Quantity__c, 
                       UnitPrice__c, LineTotal__c, Description__c
                FROM OrderItem__c 
                WHERE Order__c = :orderId
                ORDER BY CreatedDate
            ];
            
            OrderDetailWrapper wrapper = new OrderDetailWrapper();
            wrapper.order = order;
            wrapper.orderItems = orderItems;
            
            return wrapper;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving order: ' + e.getMessage());
        }
    }
    
    /**
     * @description Saves an order (create or update) with its order items
     * @param orderData JSON string containing order and order items data
     * @param orderId Optional order ID for updates
     * @return OrderDetailWrapper containing saved order and items
     */
    @AuraEnabled
    public static OrderDetailWrapper saveOrder(String orderData, Id orderId) {
        try {
            Map<String, Object> orderMap = (Map<String, Object>) JSON.deserializeUntyped(orderData);
            
            // Create or update order
            Order__c order;
            if (orderId != null) {
                order = [SELECT Id FROM Order__c WHERE Id = :orderId LIMIT 1];
            } else {
                order = new Order__c();
            }
            
            // Map order fields
            order.OrderNumber__c = (String) orderMap.get('OrderNumber__c');
            order.Customer__c = (String) orderMap.get('Customer__c');
            order.OrderDate__c = Date.valueOf((String) orderMap.get('OrderDate__c'));
            order.Status__c = (String) orderMap.get('Status__c');
            order.TotalAmount__c = (Decimal) orderMap.get('TotalAmount__c');
            order.ShippingAddress__c = (String) orderMap.get('ShippingAddress__c');
            order.BillingAddress__c = (String) orderMap.get('BillingAddress__c');
            order.Notes__c = (String) orderMap.get('Notes__c');
            
            upsert order;
            
            // Handle order items
            List<Object> orderItemsData = (List<Object>) orderMap.get('orderItems');
            List<OrderItem__c> orderItemsToUpsert = new List<OrderItem__c>();
            List<Id> existingItemIds = new List<Id>();
            
            if (orderItemsData != null) {
                for (Object itemObj : orderItemsData) {
                    Map<String, Object> itemMap = (Map<String, Object>) itemObj;
                    
                    OrderItem__c item = new OrderItem__c();
                    String itemId = (String) itemMap.get('Id');
                    
                    if (itemId != null && !itemId.startsWith('temp_')) {
                        item.Id = itemId;
                        existingItemIds.add(itemId);
                    }
                    
                    item.Order__c = order.Id;
                    item.Product__c = (String) itemMap.get('Product__c');
                    item.ProductName__c = (String) itemMap.get('ProductName__c');
                    item.ProductCode__c = (String) itemMap.get('ProductCode__c');
                    item.Quantity__c = (Decimal) itemMap.get('Quantity__c');
                    item.UnitPrice__c = (Decimal) itemMap.get('UnitPrice__c');
                    item.LineTotal__c = (Decimal) itemMap.get('LineTotal__c');
                    item.Description__c = (String) itemMap.get('Description__c');
                    
                    orderItemsToUpsert.add(item);
                }
            }
            
            // Delete removed items
            if (orderId != null) {
                List<OrderItem__c> itemsToDelete = [
                    SELECT Id FROM OrderItem__c 
                    WHERE Order__c = :order.Id 
                    AND Id NOT IN :existingItemIds
                ];
                if (!itemsToDelete.isEmpty()) {
                    delete itemsToDelete;
                }
            }
            
            // Upsert order items
            if (!orderItemsToUpsert.isEmpty()) {
                upsert orderItemsToUpsert;
            }
            
            // Return updated order with items
            return getOrderById(order.Id);
            
        } catch (Exception e) {
            throw new AuraHandledException('Error saving order: ' + e.getMessage());
        }
    }
    
    /**
     * @description Deletes an order and its related order items
     * @param orderId The ID of the order to delete
     */
    @AuraEnabled
    public static void deleteOrder(Id orderId) {
        try {
            // Delete order items first (if not using cascade delete)
            List<OrderItem__c> orderItems = [
                SELECT Id FROM OrderItem__c WHERE Order__c = :orderId
            ];
            if (!orderItems.isEmpty()) {
                delete orderItems;
            }
            
            // Delete the order
            Order__c order = [SELECT Id FROM Order__c WHERE Id = :orderId LIMIT 1];
            delete order;
            
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting order: ' + e.getMessage());
        }
    }
    
    /**
     * @description Retrieves all customers for order assignment
     * @return List of Account records
     */
    @AuraEnabled(cacheable=true)
    public static List<Account> getCustomers() {
        try {
            return [
                SELECT Id, Name, Phone, BillingAddress
                FROM Account 
                WHERE Type = 'Customer'
                ORDER BY Name
                LIMIT 1000
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving customers: ' + e.getMessage());
        }
    }
    
    /**
     * @description Retrieves all products for order items
     * @return List of Product2 records
     */
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProducts() {
        try {
            return [
                SELECT Id, Name, ProductCode, Description, 
                       (SELECT UnitPrice FROM PricebookEntries WHERE Pricebook2.IsStandard = true LIMIT 1)
                FROM Product2 
                WHERE IsActive = true
                ORDER BY Name
                LIMIT 1000
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving products: ' + e.getMessage());
        }
    }
    
    /**
     * @description Updates the status of an order
     * @param orderId The ID of the order to update
     * @param newStatus The new status value
     */
    @AuraEnabled
    public static void updateOrderStatus(Id orderId, String newStatus) {
        try {
            Order__c order = [SELECT Id, Status__c FROM Order__c WHERE Id = :orderId LIMIT 1];
            order.Status__c = newStatus;
            update order;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating order status: ' + e.getMessage());
        }
    }
    
    /**
     * @description Wrapper class for order data in list view
     */
    public class OrderWrapper {
        @AuraEnabled public String id { get; set; }
        @AuraEnabled public String orderNumber { get; set; }
        @AuraEnabled public String customerName { get; set; }
        @AuraEnabled public Date orderDate { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public Decimal totalAmount { get; set; }
        @AuraEnabled public String shippingAddress { get; set; }
        @AuraEnabled public String billingAddress { get; set; }
        @AuraEnabled public String notes { get; set; }
    }
    
    /**
     * @description Wrapper class for order details with items
     */
    public class OrderDetailWrapper {
        @AuraEnabled public Order__c order { get; set; }
        @AuraEnabled public List<OrderItem__c> orderItems { get; set; }
    }
}