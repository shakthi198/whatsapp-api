import React, { useState } from "react";
import CatalogPage from "../Components/CatalogPage";
import AddCatalogPopup from "../Components/AddCatalogPopup";
import AddShippingPricePopup from "../Components/AddShippingPricePopup";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [catalogs, setCatalogs] = useState([]);
  const [shippingPrices, setShippingPrices] = useState([]);

  // Add New Catalog
  const handleAddCatalog = (newCatalog) => {
    setCatalogs([...catalogs, newCatalog]);
    setIsOpen(false);
  };

  // Add New Shipping Price
  const handleAddShippingPrice = (price) => {
    setShippingPrices([...shippingPrices, price]);
    setIsShippingOpen(false);
  };

  return (
    <div >
      <CatalogPage 
        catalogs={catalogs} 
        onAddClick={() => setIsOpen(true)} 
        onAddShippingClick={() => setIsShippingOpen(true)} 
      />
      <AddCatalogPopup 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSubmit={handleAddCatalog} 
      />
      <AddShippingPricePopup
        isOpen={isShippingOpen}
        onClose={() => setIsShippingOpen(false)}
        onSubmit={handleAddShippingPrice}
      />
    </div>
  );
};

export default App;