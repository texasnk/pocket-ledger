import { useQuery } from '@tanstack/react-query';
import { getHistory } from '../services/history';
export const useHistory = () => useQuery({ queryKey: ['history'], queryFn: getHistory });
