(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false,
    );
  });
})();

let likeBtns = document.querySelectorAll(".like-btn");

likeBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault(); // stop link redirect

    let icon = btn.querySelector("i");

    icon.classList.toggle("fa-regular");
    icon.classList.toggle("fa-solid");
    icon.classList.toggle("liked");
  });
});

function confirmDelete() {

    return confirm(
        "Are you sure you want to delete this listing?"
    );
}

function cancelBooking() {

    return confirm(
        "Are you sure you want to cancel this booking?"
    );
}

const checkIn = document.getElementById("check-in");
const checkOut = document.getElementById("check-out");
const nightsText = document.getElementById("nights");
const taxesText = document.getElementById("taxes");
const totalPriceText = document.getElementById("total-price");

let guests = 1;

function changeGuests(delta) {
    guests = Math.max(1, Math.min(10, guests + delta));
    document.getElementById('guest-count').textContent = guests;
    document.getElementById('guest-label').textContent = guests + (guests === 1 ? ' guest' : ' guests');

    const guestsDisplay = document.getElementById('guests-display');
    if (guestsDisplay) guestsDisplay.textContent = guests;

    const guestsInput = document.getElementById('guests-input');
    if (guestsInput) guestsInput.value = guests;

    calculatePrice();
}

if (checkIn && checkOut) {
    const today = new Date();
    const checkoutDefault = new Date();
    checkoutDefault.setDate(today.getDate() + 2);

    const formatDate = (date) => date.toISOString().split('T')[0];

    checkIn.min = formatDate(today);
    checkIn.value = formatDate(today);
    checkOut.min = formatDate(today);
    checkOut.value = formatDate(checkoutDefault);

    function calculatePrice() {
        if (checkIn.value && checkOut.value) {
            const start = new Date(checkIn.value);
            const end = new Date(checkOut.value);
            const diffTime = end - start;
            const nights = diffTime / (1000 * 60 * 60 * 24);

            if (nights > 0) {
                const subtotal = pricePerNight * nights * guests;
                const taxes = Math.round(subtotal * 0.05);
                const grandTotal = subtotal + taxes;

                nightsText.textContent = nights;
                taxesText.textContent = taxes.toLocaleString('en-IN');
                totalPriceText.textContent = '₹' + subtotal.toLocaleString('en-IN');
                document.getElementById('grand-total').textContent = '₹' + grandTotal.toLocaleString('en-IN');
                document.getElementById('breakdown').style.display = 'block';
            }
        }
    }

    checkIn.addEventListener("change", calculatePrice);
    checkOut.addEventListener("change", calculatePrice);

    calculatePrice();
}
