import api from './api';

export interface InventoryCategory {
    id: number;
    name: string;
    description: string;
    item_count: number;
}

export interface InventoryItem {
    id: number;
    category: number;
    category_name: string;
    name: string;
    item_code: string;
    description: string;
    unit: string;
    is_asset: boolean;
    asset_tag_prefix: string;
    reorder_level: number;
    stock_quantity: number;
}

export interface InventoryStock {
    id: number;
    item: number;
    item_name: string;
    category_name: string;
    quantity: number;
    last_updated: string;
}

export interface InventoryIssue {
    id: number;
    item: number;
    item_name: string;
    issued_to_staff: number | null;
    staff_name: string | null;
    issued_to_room: string | null;
    quantity: number;
    issue_date: string;
    due_date: string | null;
    return_date: string | null;
    status: 'ISSUED' | 'RETURNED' | 'LOST' | 'DAMAGED';
    remarks: string;
    issued_by: number;
    issued_by_name: string;
}

export const inventoryService = {
    // Categories
    getCategories: async (params?: any) => {
        const response = await api.get('/inventory/categories/', { params });
        return response.data;
    },
    createCategory: async (data: Partial<InventoryCategory>) => {
        const response = await api.post('/inventory/categories/', data);
        return response.data;
    },

    // Items
    getItems: async (params?: any) => {
        const response = await api.get('/inventory/items/', { params });
        return response.data;
    },
    createItem: async (data: Partial<InventoryItem>) => {
        const response = await api.post('/inventory/items/', data);
        return response.data;
    },
    updateItem: async (id: number, data: Partial<InventoryItem>) => {
        const response = await api.patch(`/inventory/items/${id}/`, data);
        return response.data;
    },
    addStock: async (id: number, data: { quantity: number; remarks?: string; reference_id?: string }) => {
        const response = await api.post(`/inventory/items/${id}/add-stock/`, data);
        return response.data;
    },

    // Stock
    getStock: async (params?: any) => {
        const response = await api.get('/inventory/stock/', { params });
        return response.data;
    },

    // Issues
    getIssues: async (params?: any) => {
        const response = await api.get('/inventory/issues/', { params });
        return response.data;
    },
    issueItem: async (data: Partial<InventoryIssue>) => {
        const response = await api.post('/inventory/issues/', data);
        return response.data;
    },
    returnItem: async (id: number) => {
        const response = await api.post(`/inventory/issues/${id}/return/`);
        return response.data;
    },

    // Transactions
    getTransactions: async (params?: any) => {
        const response = await api.get('/inventory/transactions/', { params });
        return response.data;
    }
};
