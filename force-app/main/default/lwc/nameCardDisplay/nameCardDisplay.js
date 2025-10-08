import { LightningElement } from 'lwc';

export default class NameCardDisplay extends LightningElement {
    // Sample data - In production, this would typically come from Apex or @wire
    names = [
        {
            id: '1',
            name: 'John Smith',
            title: 'Sales Manager',
            department: 'Sales',
            email: 'john.smith@example.com'
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            title: 'Marketing Director',
            department: 'Marketing',
            email: 'sarah.johnson@example.com'
        },
        {
            id: '3',
            name: 'Michael Chen',
            title: 'Software Engineer',
            department: 'Engineering',
            email: 'michael.chen@example.com'
        },
        {
            id: '4',
            name: 'Emily Davis',
            title: 'HR Specialist',
            department: 'Human Resources',
            email: 'emily.davis@example.com'
        },
        {
            id: '5',
            name: 'Robert Wilson',
            title: 'Financial Analyst',
            department: 'Finance',
            email: 'robert.wilson@example.com'
        },
        {
            id: '6',
            name: 'Lisa Anderson',
            title: 'Product Manager',
            department: 'Product',
            email: 'lisa.anderson@example.com'
        },
        {
            id: '7',
            name: 'David Martinez',
            title: 'Customer Success Manager',
            department: 'Customer Success',
            email: 'david.martinez@example.com'
        },
        {
            id: '8',
            name: 'Jennifer Taylor',
            title: 'Operations Manager',
            department: 'Operations',
            email: 'jennifer.taylor@example.com'
        },
        {
            id: '9',
            name: 'James Brown',
            title: 'Senior Developer',
            department: 'Engineering',
            email: 'james.brown@example.com'
        },
        {
            id: '10',
            name: 'Maria Garcia',
            title: 'Business Analyst',
            department: 'Business Operations',
            email: 'maria.garcia@example.com'
        }
    ];

    handleViewDetails(event) {
        // Get the person's ID from the button's data attribute
        const personId = event.target.dataset.id;
        const selectedPerson = this.names.find(person => person.id === personId);
        
        if (selectedPerson) {
            // Show a toast or dispatch an event with the person's details
            // In production, you might navigate to a detail page or open a modal
            const toastEvent = new ShowToastEvent({
                title: 'Person Details',
                message: `Selected: ${selectedPerson.name} - ${selectedPerson.title}`,
                variant: 'info'
            });
            this.dispatchEvent(toastEvent);
        }
    }

    // Optional: Method to load names from Apex
    // @wire(getNames)
    // wiredNames({ error, data }) {
    //     if (data) {
    //         this.names = data;
    //     } else if (error) {
    //         console.error('Error loading names:', error);
    //     }
    // }
}

// Import this at the top if you want to use toast notifications
import { ShowToastEvent } from 'lightning/platformShowToastEvent';