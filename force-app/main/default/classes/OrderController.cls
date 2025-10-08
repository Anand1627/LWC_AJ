public with sharing class OrderController {
    
    @AuraEnabled(cacheable=true)
    public static List<Order__c> getOrders(String searchTerm, String statusFilter, String sortBy, String sortDirection) {
        try {
            String query = 'SELECT Id, Name, Order_Number__c, Customer__c, Customer__r.Name, Status__c, Total_Amount__c, Order_Date__c, CreatedDate FROM Order__c';
            
            List<String> conditions = new List<String>();
            
            if (String.isNotBlank(searchTerm)) {
                conditions.add('(Order_Number__c LIKE \'%' + String.escapeSingleQuotes(searchTerm) + '%\' OR Customer__r.Name LIKE \'%' + String.escapeSingleQuotes(searchTerm) + '%\')');
            }
            
            if (String.isNotBlank(statusFilter) && statusFilter != 'All') {
                conditions.add('Status__c = \'' + String.escapeSingleQuotes(statusFilter) + '\'');
            }
            
            if (!conditions.isEmpty()) {
                query += ' WHERE ' + String.join(conditions, ' AND ');
            }
            
            if (String.isNotBlank(sortBy)) {
                query += ' ORDER BY ' + String.escapeSingleQuotes(sortBy);
                if (String.isNotBlank(sortDirection)) {
                    query += ' ' + String.escapeSingleQuotes(sortDirection);
                }
            } else {
                query += ' ORDER BY CreatedDate DESC';
            }
            
            query += ' LIMIT 1000';
            
            return Database.query(query);
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving orders: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Order__c createOrder(Order__c order) {
        try {
            if (String.isBlank(order.Order_Number__c)) {
                order.Order_Number__c = generateOrderNumber();
            }
            if (order.Order_Date__c == null) {
                order.Order_Date__c = Date.today();
            }
            if (String.isBlank(order.Status__c)) {
                order.Status__c = 'Draft';
            }
            
            insert order;
            return order;
        } catch (Exception e) {
            throw new AuraHandledException('Error creating order: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Order__c updateOrder(Order__c order) {
        try {
            update order;
            return order;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating order: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void deleteOrder(Id orderId) {
        try {
            Order__c order = [SELECT Id FROM Order__c WHERE Id = :orderId];
            delete order;
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting order: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Order__c getOrderById(Id orderId) {
        try {
            return [SELECT Id, Name, Order_Number__c, Customer__c, Customer__r.Name, Status__c, 
                           Total_Amount__c, Order_Date__c, CreatedDate, LastModifiedDate,
                           (SELECT Id, Product__c, Product__r.Name, Quantity__c, Unit_Price__c, 
                                   Total_Price__c FROM Order_Items__r)
                    FROM Order__c WHERE Id = :orderId];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving order: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static List<Order_Item__c> getOrderItems(Id orderId) {
        try {
            return [SELECT Id, Product__c, Product__r.Name, Quantity__c, Unit_Price__c, Total_Price__c
                    FROM Order_Item__c WHERE Order__c = :orderId ORDER BY CreatedDate];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving order items: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Order_Item__c addOrderItem(Order_Item__c orderItem) {
        try {
            insert orderItem;
            updateOrderTotal(orderItem.Order__c);
            return orderItem;
        } catch (Exception e) {
            throw new AuraHandledException('Error adding order item: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Order_Item__c updateOrderItem(Order_Item__c orderItem) {
        try {
            update orderItem;
            updateOrderTotal(orderItem.Order__c);
            return orderItem;
        } catch (Exception e) {
            throw new AuraHandledException('Error updating order item: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void deleteOrderItem(Id orderItemId) {
        try {
            Order_Item__c orderItem = [SELECT Id, Order__c FROM Order_Item__c WHERE Id = :orderItemId];
            Id orderId = orderItem.Order__c;
            delete orderItem;
            updateOrderTotal(orderId);
        } catch (Exception e) {
            throw new AuraHandledException('Error deleting order item: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static List<Account> getCustomers() {
        try {
            return [SELECT Id, Name, Email__c, Phone FROM Account WHERE RecordType.Name = 'Customer' ORDER BY Name LIMIT 100];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving customers: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static List<Product2> getProducts() {
        try {
            return [SELECT Id, Name, ProductCode, Description, IsActive FROM Product2 WHERE IsActive = true ORDER BY Name LIMIT 100];
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving products: ' + e.getMessage());
        }
    }
    
    @AuraEnabled
    public static List<String> getOrderStatuses() {
        return new List<String>{'Draft', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'};
    }
    
    @AuraEnabled
    public static Map<String, Integer> getOrderAnalytics() {
        try {
            Map<String, Integer> analytics = new Map<String, Integer>();
            
            // Count orders by status
            for (AggregateResult ar : [SELECT Status__c, COUNT(Id) orderCount FROM Order__c GROUP BY Status__c]) {
                String status = (String) ar.get('Status__c');
                Integer count = (Integer) ar.get('orderCount');
                analytics.put(status, count);
            }
            
            // Total orders
            Integer totalOrders = [SELECT COUNT() FROM Order__c];
            analytics.put('Total', totalOrders);
            
            // Total revenue
            AggregateResult revenueResult = [SELECT SUM(Total_Amount__c) totalRevenue FROM Order__c WHERE Status__c != 'Cancelled'];
            Decimal totalRevenue = (Decimal) revenueResult.get('totalRevenue');
            analytics.put('TotalRevenue', totalRevenue != null ? totalRevenue.intValue() : 0);
            
            return analytics;
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving analytics: ' + e.getMessage());
        }
    }
    
    private static String generateOrderNumber() {
        // Generate a unique order number
        String prefix = 'ORD-';
        String timestamp = String.valueOf(System.currentTimeMillis());
        return prefix + timestamp.substring(timestamp.length() - 8);
    }
    
    private static void updateOrderTotal(Id orderId) {
        try {
            AggregateResult ar = [SELECT SUM(Total_Price__c) total FROM Order_Item__c WHERE Order__c = :orderId];
            Decimal total = (Decimal) ar.get('total');
            
            Order__c order = new Order__c(Id = orderId, Total_Amount__c = total != null ? total : 0);
            update order;
        } catch (Exception e) {
            System.debug('Error updating order total: ' + e.getMessage());
        }
    }
}