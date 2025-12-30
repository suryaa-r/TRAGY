// Universal Footer Functionality
function showShippingInfo() {
    alert('Shipping Info:\n\n• Free shipping on orders over ₹2000\n• Standard delivery: 3-5 business days\n• Express delivery: 1-2 business days\n• Cash on delivery available');
}

function showReturns() {
    alert('Returns Policy:\n\n• 30-day return policy\n• Items must be unworn with tags\n• Free returns on orders over ₹2000\n• Refund processed within 5-7 days');
}

function showSizeGuide() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;';
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0; font-family: 'Bebas Neue', cursive; font-size: 1.5rem;">SIZE GUIDE</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <img src="https://i.imgur.com/sizeGuide.jpg" alt="International Size Guide" style="width: 100%; height: auto; margin-bottom: 1rem;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div style="display: none; text-align: center; padding: 2rem; background: #f5f5f5; border-radius: 4px;">
                <h4>Size Guide</h4>
                <p><strong>S:</strong> Chest 91-96cm</p>
                <p><strong>M:</strong> Chest 96-101cm</p>
                <p><strong>L:</strong> Chest 101-106cm</p>
                <p><strong>XL:</strong> Chest 106-111cm</p>
                <p><strong>XXL:</strong> Chest 111-116cm</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showSustainability() {
    alert('Sustainability:\n\n• Eco-friendly materials\n• Ethical manufacturing\n• Carbon-neutral shipping\n• Recycling program available');
}