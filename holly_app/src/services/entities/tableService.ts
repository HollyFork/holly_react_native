import { Table } from "@/models/Table";

import apiClient from "../utils/api";

const BASE_PATH = '/tables';

export const getTablesBySalleId = async (salleId: number) => {
    return apiClient.get<Table[]>(`${BASE_PATH}?salle_id=${salleId}`);
};

export const tableService = {
    getTablesBySalleId: getTablesBySalleId,
};