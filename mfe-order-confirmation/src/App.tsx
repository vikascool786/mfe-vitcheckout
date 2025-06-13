import './App.css';
import OrderHeader from "./components/OrderHeader";
import OrderSummary from "./components/OrderSummary";
import PaymentMethod from "./components/PaymentMethod";
import ShippingAddress from "./components/ShippingAddress";

const App = () => {
  return (
    <main>
      <section className="order-header">
        <OrderHeader orderId="1235378422" amount="13.42" />
        <p className="delivery-estimate">Estimated Delivery Date Tuesday, April 15</p>
        <p className="email-confirmation">We sent a confirmation email to rubyb@shop.com</p>
        <a href="#" className="print-link">Print Order Confirmation</a>
      </section>

      <div className="layout-grid">
        <div className="left-column">
          <section className="product-summary">
            <h3>Product Summary</h3>
            <div className="product-card">
              <div className="product-image">
                <img src="https://via.placeholder.com/100x120" alt="Isotonix Calcium Plus" />
              </div>
              <div className="product-details">
                <h4>Isotonix Calcium Plus</h4>
                <p>Single Bottle (90 Servings)</p>
                <p>+ $0.52 Cashback</p>
                <p>Quantity: 1</p>
              </div>
              <div className="product-price">$25.00</div>
            </div>
            <p className="estimated-date">Estimated Delivery Date Tuesday, April 15</p>
          </section>

          <section className="shipping-summary">
            <h3>Shipping Summary</h3>
            <ShippingAddress
              name="Ruby Boyle"
              address="1 Lower Ragsdale Dr"
              cityStateZip="Monterey, CA 93940"
              phone="831-123-4567"
            />
          </section>

          <section className="vift-balance">
            <h3>VIFT Balance</h3>
            <div className="vift-tag">
              <span>VIFT™</span>
              <strong>$13.42</strong>
            </div>
          </section>

          <section className="order-updates">
            <h3>Order Updates</h3>
            <label>
              <input type="checkbox" /> Want to receive text messages on this order?
            </label>
            <p className="disclaimer">Message and data rates may apply.</p>
          </section>
        </div>

        <div className="right-column">
          <section className="order-summary">
            <h3>Order Summary</h3>
            <PaymentMethod method="Mastercard 0469" />
            <OrderSummary
              subtotal="$25.00"
              tax="$2.02"
              shipping="$6.00"
              cashback="$10.47"
              total="$12.55"
            />
            <div className="cashback-earned">
              <span>$0.25</span> VIFT Cashback Earned in this order
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default App;
