import { register } from "react-refresh";

const API_BASE_URL = "http://localhost/whatsapp_admin/";

const apiEndpoints = {
    addContact: `${API_BASE_URL}/add_contact.php`,
    language:`${API_BASE_URL}/language.php`,
    register: `${API_BASE_URL}/register.php`,
    Category: `${API_BASE_URL}/category.php`,
    whatsapplogapi: `${API_BASE_URL}/whatsapp_log.php`,
    customer_profile: `${API_BASE_URL}/customer_profile.php`,
    getinfophp: `${API_BASE_URL}/get_user_info.php`,
    transaction: `${API_BASE_URL}/add_transaction.php`,
    getProfile: `${API_BASE_URL}/register.php`,
    addtransaction: `${API_BASE_URL}/add_transaction.php`,
    getGroups: `${API_BASE_URL}/get_groups.php`,
    managetemplate: `${API_BASE_URL}/managetemplate.php`,
    whatsappLog: `${API_BASE_URL}/whatsapp_log.php`,
  };

export default apiEndpoints;
