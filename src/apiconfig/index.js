const API_BASE_URL = "http://localhost/whatsapp_admin";

const apiEndpoints = {
  managetemplate: `${API_BASE_URL}/managetemplate.php`,
    addContact: `${API_BASE_URL}/add_contact.php`,
    language:`${API_BASE_URL}/language.php`,
    Category: `${API_BASE_URL}/category.php`,
    transaction: `${API_BASE_URL}/add_transaction.php`,
    getProfile: `${API_BASE_URL}/register.php`,
};

export default apiEndpoints;
