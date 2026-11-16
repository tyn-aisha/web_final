# Obsidian Detailing

A study project for the Web Technologies 1 (Front End) course: Midterm, Endterm and Final.
A website of a premium car detailing studio in Astana.


## Pages and authors

| Page | Contents | Author |
|---|---|---|
| index.html | Hero with the nearest free slot, counters, advantages, steps, reviews with filter, search and sorting | Imanalyuly Dinmukhammet |
| contacts.html | Contacts, opening hours with an "open now" status, map, quick answers, contact form with a saved draft, copy buttons | Imanalyuly Dinmukhammet |
| services.html | Packages, price list with search, filter, sorting and calculation, package finder, package comparison, installment calculator, FAQ | Seitzhan Yeraly |
| works.html | Before/after slider, gallery with filter, lightbox and favorites | Tynyshtykbay Aisha |
| booking.html | Booking form, price calculator, promo code, free time slots, services chosen on the Services page, "My bookings" | Bertan Maidabek |
| account.html | Personal account: Sign Up, Log In, Profile with prices for the car class, bookings and favorite works, edit and delete the account (localStorage) | Tynyshtykbay Aisha |

## What is new in the Final

Shared:
- Light and dark mode: a toggle in the navigation bar of every page. The choice is saved in localStorage (`obsidian_theme`) and works with the keyboard. All colors are CSS variables (`css/style.css`).
- Services chosen on the Services page are saved in localStorage (`obsidian_cart`, JSON) and shown on the Booking page, with a counter on the "Записаться" button.
- Shared notifications (`js/toast.js`) and a shared storage helper (`js/store.js`).
- Endterm remarks fixed: the "Записаться" banner on Services and Works now looks the same as on Home; the chosen services no longer disappear when the visitor goes to the booking.

By member:
- Bertan (Booking): "My bookings" (`js/bookings.js`, `obsidian_bookings`): a saved booking, cancel and clear, a calendar file `.ics`; name, phone and e-mail filled in from the profile; the button "Choose the recommended package".
- Dinmukhammet (Home and Contacts): the block "Nearest free slot" (`js/schedule.js`, the same busy-slot logic as the booking page); a draft of the contact form (`obsidian_contact_draft`); buttons to copy the phone and the address.
- Yeraly (Services): comparison of two packages; an installment calculator for 3, 6 and 12 months; the result of the package finder is saved (`obsidian_recommendation`).
- Aisha (Works and Account): favorite works (`js/favorites.js`, `obsidian_favorites`) with a filter, a counter in the menu and a block in the profile; the block "My bookings" in the profile; a password strength indicator; the theme, the saved services and the notifications.

## Structure

```
css/   style.css (shared styles), forms.css, tools.css and one file per page
js/    theme.js (mode), common.js (jQuery effects), store.js (storage), toast.js (notifications),
       auth.js (accounts), cart.js (saved services), favorites.js (favorites), bookings.js (bookings),
       schedule.js (schedule), validate.js (form validation), data.js (shared data) and one file per page
img/   illustrations (SVG)
```

## Technologies

HTML5, CSS (Flexbox, Grid, variables, media queries), Bootstrap 5.3, JavaScript, jQuery 3.7.
