const API_BASE_URL = "http://localhost/whatsapp";


const apiEndpoints = {
    addContact: `${API_BASE_URL}/add_contact.php`,
    language:`${API_BASE_URL}/language.php`,
    // register: `${API_BASE_URL}/register.php`,
    Category: `${API_BASE_URL}/category.php`,
    customer_profile: `${API_BASE_URL}/customer_profile.php`,
    // getinfophp: `${API_BASE_URL}/get_user_info.php`,
    transaction: `${API_BASE_URL}/add_transaction.php`,
    getProfile: `${API_BASE_URL}/register.php`,
    addtransaction: `${API_BASE_URL}/add_transaction.php`,
    getGroups: `${API_BASE_URL}/get_groups.php`,
    managetemplate: `${API_BASE_URL}/managetemplate.php`,
    whatsappLog: `${API_BASE_URL}/whatsapp_log.php`,
    fetchTemplate : `${API_BASE_URL}/fetchtemplate.php`,
    apiurl : `${API_BASE_URL}/api_settings.php`,
    fetchmessage : `${API_BASE_URL}/message_crud.php`,
    metaTemplates: `${API_BASE_URL}/meta_templates.php`,
    Reports: `${API_BASE_URL}/reports.php`,
    dashboard: `${API_BASE_URL}/dashboard.php`,
  };

export default apiEndpoints;
