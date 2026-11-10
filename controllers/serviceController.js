const Pet = require('../models/petModel');
const Service = require('../models/serviceModel');
const ServiceBooking = require('../models/serviceBookingModel');

const BOOKING_SUCCESS = 'Booking created. Payment is pending; no payment has been processed.';
const INVALID_BOOKING = 'Choose a pet, service, and valid booking date.';
const UNAVAILABLE_BOOKING = 'That pet or service is unavailable for booking.';
const BOOKING_FAILURE = 'Unable to create the booking. Please try again.';

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isPositiveIntegerId(value) {
  return typeof value === 'string'
    && /^\d+$/.test(value)
    && Number.isSafeInteger(Number(value))
    && Number(value) > 0;
}

function isValidBookingDate(value, today) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const daysInMonth = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31
  ];

  return month >= 1
    && month <= 12
    && day >= 1
    && day <= daysInMonth[month - 1]
    && value >= today;
}

function showServicePage(req, res, pets, services) {
  const requestedPetId = req.query.petId;
  const selectedPet = pets.find((pet) => String(pet.id) === requestedPetId);

  return res.render('services', {
    pets,
    services,
    selectedPetId: selectedPet ? String(selectedPet.id) : '',
    today: localDateString(),
    messages: req.flash('success'),
    errors: req.flash('error'),
    session: req.session
  });
}

function listServices(req, res) {
  const ownerId = req.session.user.id;

  Pet.getByOwner(ownerId, (petError, pets) => {
    if (petError) {
      console.error('Error loading pets for service booking:', petError);
      return res.status(500).send('Unable to load pets.');
    }

    Service.getActiveServices((serviceError, services) => {
      if (serviceError) {
        console.error('Error loading services:', serviceError);
        return res.status(500).send('Unable to load services.');
      }

      return showServicePage(req, res, pets, services);
    });
  });
}

function createBooking(req, res) {
  const { petId, serviceId, bookingDate } = req.body;
  const today = localDateString();

  if (
    !isPositiveIntegerId(petId)
    || !isPositiveIntegerId(serviceId)
    || !isValidBookingDate(bookingDate, today)
  ) {
    req.flash('error', INVALID_BOOKING);
    return res.redirect('/services');
  }

  const ownerId = req.session.user.id;
  ServiceBooking.createPendingBooking(
    ownerId,
    Number(petId),
    Number(serviceId),
    bookingDate,
    (error, booking) => {
      if (error) {
        console.error('Error creating service booking:', error);
        req.flash('error', BOOKING_FAILURE);
        return res.redirect(`/services?petId=${encodeURIComponent(petId)}`);
      }

      if (!booking) {
        req.flash('error', UNAVAILABLE_BOOKING);
        return res.redirect('/services');
      }

      req.flash('success', BOOKING_SUCCESS);
      return res.redirect('/bookings');
    }
  );
}

function listBookings(req, res) {
  ServiceBooking.getBookingsByOwner(req.session.user.id, (error, bookings) => {
    if (error) {
      console.error('Error loading booking history:', error);
      return res.status(500).send('Unable to load booking history.');
    }

    return res.render('bookings', {
      bookings,
      messages: req.flash('success'),
      errors: req.flash('error'),
      session: req.session
    });
  });
}

module.exports = { listServices, createBooking, listBookings };
