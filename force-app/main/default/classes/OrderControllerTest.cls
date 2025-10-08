/**
 * @description Test class for OrderController
 * @author System Administrator
 * @date 2024
 */
@isTest
private class OrderControllerTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test accounts (customers)
        List<Account> customers = new List<Account>();
        for (Integer i = 1; i <= 3; i++) {
            customers.add(new Account(
                Name = 'Test Customer ' + i,
                Type = 'Customer',
                Phone = '555-000-000' + i,
                BillingStreet = '123 Test St ' + i,
                BillingCity = 'Test City',
                BillingState = 'CA',
                BillingPostalCode = '9000' + i
            ));
        }
        insert customers;
        
        // Create test products
        List<Product2> products = new List<Product2>();
        for (Integer i = 1; i <= 5; i++) {
            products.add(new Product2(
                Name = 'Test Product ' + i,
                ProductCode = 'PROD-00' + i,
                Description = 'Test product description ' + i,
                IsActive = true
            ));
        }
        insert products;
        
        // Create standard pricebook entries
        Id standardPricebookId = Test.getStandardPricebookId();
        List<PricebookEntry> pricebookEntries = new List<PricebookEntry>();
        for (Product2 product : products) {
            pricebookEntries.add(new PricebookEntry(
                Pricebook2Id = standardPricebookId,
                Product2Id = product.Id,
                UnitPrice = 100.00 + (Integer.valueOf(product.ProductCode.substring(6)) * 10),
                IsActive = true
            ));
        }
        insert pricebookEntries;
        
        // Create test orders
        List<Order__c> orders = new List<Order__c>();
        for (Integer i = 1; i <= 3; i++) {
            orders.add(new Order__c(
                OrderNumber__c = 'ORD-2024-000' + i,
                Customer__c = customers[i-1].Id,
                OrderDate__c = Date.today().addDays(-i),
                Status__c = i == 1 ? 'Draft' : (i == 2 ? 'Confirmed' : 'Shipped'),
                TotalAmount__c = 100.00 * i,
                ShippingAddress__c = '123 Shipping St ' + i + '\nTest City, CA 9000' + i,
                BillingAddress__c = '123 Billing St ' + i + '\nTest City, CA 9000' + i,
                Notes__c = 'Test order notes ' + i
            ));
        }
        insert orders;
        
        // Create test order items
        List<OrderItem__c> orderItems = new List<OrderItem__c>();
        for (Integer i = 0; i < orders.size(); i++) {
            for (Integer j = 0; j < 2; j++) {
                orderItems.add(new OrderItem__c(
                    Order__c = orders[i].Id,
                    Product__c = products[j].Id,
                    ProductName__c = products[j].Name,
                    ProductCode__c = products[j].ProductCode,
                    Quantity__c = j + 1,
                    UnitPrice__c = 50.00 + (j * 10),
                    LineTotal__c = (50.00 + (j * 10)) * (j + 1),
                    Description__c = 'Test item description'
                ));
            }
        }
        insert orderItems;
    }
    
    @isTest
    static void testGetOrders() {
        Test.startTest();
        List<OrderController.OrderWrapper> orders = OrderController.getOrders();
        Test.stopTest();
        
        System.assertNotEquals(null, orders, 'Orders list should not be null');
        System.assertEquals(3, orders.size(), 'Should return 3 orders');
        
        OrderController.OrderWrapper firstOrder = orders[0];
        System.assertNotEquals(null, firstOrder.id, 'Order ID should not be null');
        System.assertNotEquals(null, firstOrder.orderNumber, 'Order number should not be null');
        System.assertNotEquals(null, firstOrder.customerName, 'Customer name should not be null');
        System.assertNotEquals(null, firstOrder.orderDate, 'Order date should not be null');
        System.assertNotEquals(null, firstOrder.status, 'Status should not be null');
    }
    
    @isTest
    static void testGetOrderById() {
        Order__c testOrder = [SELECT Id FROM Order__c LIMIT 1];
        
        Test.startTest();
        OrderController.OrderDetailWrapper orderDetail = OrderController.getOrderById(testOrder.Id);
        Test.stopTest();
        
        System.assertNotEquals(null, orderDetail, 'Order detail should not be null');
        System.assertNotEquals(null, orderDetail.order, 'Order should not be null');
        System.assertNotEquals(null, orderDetail.orderItems, 'Order items should not be null');
        System.assertEquals(2, orderDetail.orderItems.size(), 'Should have 2 order items');
    }
    
    @isTest
    static void testSaveNewOrder() {
        Account customer = [SELECT Id FROM Account LIMIT 1];
        Product2 product = [SELECT Id, Name, ProductCode FROM Product2 LIMIT 1];
        
        Map<String, Object> orderData = new Map<String, Object>{
            'OrderNumber__c' => 'ORD-2024-TEST',
            'Customer__c' => customer.Id,
            'OrderDate__c' => String.valueOf(Date.today()),
            'Status__c' => 'Draft',
            'TotalAmount__c' => 150.00,
            'ShippingAddress__c' => 'Test Shipping Address',
            'BillingAddress__c' => 'Test Billing Address',
            'Notes__c' => 'Test notes',
            'orderItems' => new List<Map<String, Object>>{
                new Map<String, Object>{
                    'Product__c' => product.Id,
                    'ProductName__c' => product.Name,
                    'ProductCode__c' => product.ProductCode,
                    'Quantity__c' => 3,
                    'UnitPrice__c' => 50.00,
                    'LineTotal__c' => 150.00,
                    'Description__c' => 'Test item'
                }
            }
        };
        
        Test.startTest();
        OrderController.OrderDetailWrapper result = OrderController.saveOrder(
            JSON.serialize(orderData), 
            null
        );
        Test.stopTest();
        
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertNotEquals(null, result.order, 'Order should not be null');
        System.assertEquals('ORD-2024-TEST', result.order.OrderNumber__c, 'Order number should match');
        System.assertEquals(1, result.orderItems.size(), 'Should have 1 order item');
    }
    
    @isTest
    static void testUpdateExistingOrder() {
        Order__c existingOrder = [SELECT Id, OrderNumber__c FROM Order__c LIMIT 1];
        Account customer = [SELECT Id FROM Account LIMIT 1];
        
        Map<String, Object> orderData = new Map<String, Object>{
            'OrderNumber__c' => existingOrder.OrderNumber__c,
            'Customer__c' => customer.Id,
            'OrderDate__c' => String.valueOf(Date.today()),
            'Status__c' => 'Confirmed',
            'TotalAmount__c' => 200.00,
            'ShippingAddress__c' => 'Updated Shipping Address',
            'BillingAddress__c' => 'Updated Billing Address',
            'Notes__c' => 'Updated notes',
            'orderItems' => new List<Map<String, Object>>()
        };
        
        Test.startTest();
        OrderController.OrderDetailWrapper result = OrderController.saveOrder(
            JSON.serialize(orderData), 
            existingOrder.Id
        );
        Test.stopTest();
        
        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals('Confirmed', result.order.Status__c, 'Status should be updated');
        System.assertEquals(200.00, result.order.TotalAmount__c, 'Total amount should be updated');
    }
    
    @isTest
    static void testDeleteOrder() {
        Order__c testOrder = [SELECT Id FROM Order__c LIMIT 1];
        Id orderId = testOrder.Id;
        
        Test.startTest();
        OrderController.deleteOrder(orderId);
        Test.stopTest();
        
        List<Order__c> remainingOrders = [SELECT Id FROM Order__c WHERE Id = :orderId];
        System.assertEquals(0, remainingOrders.size(), 'Order should be deleted');
        
        List<OrderItem__c> remainingItems = [SELECT Id FROM OrderItem__c WHERE Order__c = :orderId];
        System.assertEquals(0, remainingItems.size(), 'Order items should be deleted');
    }
    
    @isTest
    static void testGetCustomers() {
        Test.startTest();
        List<Account> customers = OrderController.getCustomers();
        Test.stopTest();
        
        System.assertNotEquals(null, customers, 'Customers list should not be null');
        System.assertEquals(3, customers.size(), 'Should return 3 customers');
        
        for (Account customer : customers) {
            System.assertEquals('Customer', customer.Type, 'All accounts should be customers');
        }
    }
    
    @isTest
    static void testGetProducts() {
        Test.startTest();
        List<Product2> products = OrderController.getProducts();
        Test.stopTest();
        
        System.assertNotEquals(null, products, 'Products list should not be null');
        System.assertEquals(5, products.size(), 'Should return 5 products');
        
        for (Product2 product : products) {
            System.assertEquals(true, product.IsActive, 'All products should be active');
        }
    }
    
    @isTest
    static void testUpdateOrderStatus() {
        Order__c testOrder = [SELECT Id, Status__c FROM Order__c WHERE Status__c = 'Draft' LIMIT 1];
        
        Test.startTest();
        OrderController.updateOrderStatus(testOrder.Id, 'Confirmed');
        Test.stopTest();
        
        Order__c updatedOrder = [SELECT Status__c FROM Order__c WHERE Id = :testOrder.Id];
        System.assertEquals('Confirmed', updatedOrder.Status__c, 'Status should be updated');
    }
    
    @isTest
    static void testErrorHandling() {
        // Test with invalid order ID
        Test.startTest();
        try {
            OrderController.getOrderById('001000000000000');
            System.assert(false, 'Should have thrown an exception');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Error retrieving order'), 'Should contain error message');
        }
        
        // Test delete with invalid ID
        try {
            OrderController.deleteOrder('001000000000000');
            System.assert(false, 'Should have thrown an exception');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Error deleting order'), 'Should contain error message');
        }
        Test.stopTest();
    }
    
    @isTest
    static void testSaveOrderWithInvalidData() {
        // Test with invalid JSON
        Test.startTest();
        try {
            OrderController.saveOrder('invalid json', null);
            System.assert(false, 'Should have thrown an exception');
        } catch (AuraHandledException e) {
            System.assert(e.getMessage().contains('Error saving order'), 'Should contain error message');
        }
        Test.stopTest();
    }
    
    @isTest
    static void testOrderWrapperClass() {
        OrderController.OrderWrapper wrapper = new OrderController.OrderWrapper();
        wrapper.id = 'test-id';
        wrapper.orderNumber = 'ORD-001';
        wrapper.customerName = 'Test Customer';
        wrapper.orderDate = Date.today();
        wrapper.status = 'Draft';
        wrapper.totalAmount = 100.00;
        
        System.assertEquals('test-id', wrapper.id);
        System.assertEquals('ORD-001', wrapper.orderNumber);
        System.assertEquals('Test Customer', wrapper.customerName);
        System.assertEquals(Date.today(), wrapper.orderDate);
        System.assertEquals('Draft', wrapper.status);
        System.assertEquals(100.00, wrapper.totalAmount);
    }
    
    @isTest
    static void testOrderDetailWrapperClass() {
        Order__c testOrder = [SELECT Id FROM Order__c LIMIT 1];
        List<OrderItem__c> testItems = [SELECT Id FROM OrderItem__c WHERE Order__c = :testOrder.Id];
        
        OrderController.OrderDetailWrapper wrapper = new OrderController.OrderDetailWrapper();
        wrapper.order = testOrder;
        wrapper.orderItems = testItems;
        
        System.assertEquals(testOrder.Id, wrapper.order.Id);
        System.assertEquals(testItems.size(), wrapper.orderItems.size());
    }
}