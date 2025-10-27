import { register } from "react-refresh";

const API_BASE_URL = "http://localhost/whatsapp";

const apiEndpoints = {
    addContact: `${API_BASE_URL}/add_contact.php`,
    language:`${API_BASE_URL}/language.php`,
    Category: `${API_BASE_URL}/category.php`,
    transaction: `${API_BASE_URL}/add_transaction.php`,
    getProfile: `${API_BASE_URL}/register.php`,
    getGroups: `${API_BASE_URL}/get_groups.php`,
    managetemplate: `${API_BASE_URL}/managetemplate.php`,
    whatsappLog: `${API_BASE_URL}/whatsapp_log.php`,
  };

export default apiEndpoints;
