import { db } from "@workspace/db";
import {
  vehiclesTable,
  usersTable,
  dealersTable,
  inquiriesTable,
  favoritesTable,
} from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  const [dealer1, dealer2, dealer3] = await db
    .insert(dealersTable)
    .values([
      {
        name: "Premium Motors GmbH",
        email: "info@premiummotors.de",
        city: "München",
        subscriptionTier: "premium",
        verified: true,
      },
      {
        name: "AutoHaus Berlin",
        email: "kontakt@autohaus-berlin.de",
        city: "Berlin",
        subscriptionTier: "standard",
        verified: true,
      },
      {
        name: "Rhein Auto GmbH",
        email: "info@rheinauto.de",
        city: "Düsseldorf",
        subscriptionTier: "premium",
        verified: false,
      },
    ])
    .returning();

  console.log("Dealers seeded:", dealer1.id, dealer2.id, dealer3.id);

  const [user1, user2] = await db
    .insert(usersTable)
    .values([
      {
        name: "Max Mustermann",
        email: "max@example.com",
        role: "user",
      },
      {
        name: "Anna Schmidt",
        email: "anna@example.com",
        role: "user",
      },
    ])
    .returning();

  console.log("Users seeded:", user1.id, user2.id);

  const vehicles = await db
    .insert(vehiclesTable)
    .values([
      {
        title: "Porsche 911 Carrera S – Sportabgasanlage",
        brand: "Porsche",
        model: "911 Carrera S",
        year: 2022,
        price: 142900,
        km: 18500,
        fuelType: "Benzin",
        transmission: "Automatik",
        vehicleType: "Sportwagen",
        location: "München",
        description:
          "Wunderschöner Porsche 911 Carrera S in Carrara-Weiß-Metallic. Vollausstattung, Sportabgasanlage, BOSE Soundsystem, Panoramadach, 20-Zoll Carrera S-Räder.",
        color: "Carrara-Weiß-Metallic",
        power: 450,
        doors: 2,
        seats: 4,
        condition: "used",
        featured: true,
        dealerId: dealer1.id,
        views: 342,
      },
      {
        title: "BMW M3 Competition – M xDrive",
        brand: "BMW",
        model: "M3 Competition",
        year: 2023,
        price: 98500,
        km: 7200,
        fuelType: "Benzin",
        transmission: "Automatik",
        vehicleType: "Limousine",
        location: "Berlin",
        description:
          "BMW M3 Competition mit M xDrive Allradantrieb. 510 PS starker Reihen-Sechszylinder-Motor. Carbon-Paket, M-Sportsitze, Head-Up Display.",
        color: "Isle of Man Grün",
        power: 510,
        doors: 4,
        seats: 5,
        condition: "used",
        featured: true,
        dealerId: dealer2.id,
        views: 219,
      },
      {
        title: "Mercedes-Benz GLE 63 AMG S – Vollausstattung",
        brand: "Mercedes-Benz",
        model: "GLE 63 AMG S",
        year: 2023,
        price: 168000,
        km: 4100,
        fuelType: "Benzin",
        transmission: "Automatik",
        vehicleType: "SUV",
        location: "Düsseldorf",
        description:
          "Mercedes-AMG GLE 63 S 4MATIC+ mit 612 PS. Panorama-Schiebedach, Burmester Soundsystem, Massage-Sitze, AMG Performance Abgasanlage, 22-Zoll AMG-Räder.",
        color: "Obsidianschwarz-Metallic",
        power: 612,
        doors: 5,
        seats: 5,
        condition: "used",
        featured: true,
        dealerId: dealer3.id,
        views: 411,
      },
      {
        title: "Audi RS6 Avant – ABT Tuning",
        brand: "Audi",
        model: "RS6 Avant",
        year: 2021,
        price: 119000,
        km: 34000,
        fuelType: "Benzin",
        transmission: "Automatik",
        vehicleType: "Kombi",
        location: "Hamburg",
        description:
          "Audi RS6 Avant mit ABT Leistungssteigerung auf 700 PS. Keramikbremsen, Carbon-Optikpaket, Matrix LED, Bang & Olufsen Soundsystem.",
        color: "Nardograu",
        power: 700,
        doors: 5,
        seats: 5,
        condition: "used",
        featured: false,
        dealerId: dealer1.id,
        views: 186,
      },
      {
        title: "Lamborghini Huracán EVO – Spyder",
        brand: "Lamborghini",
        model: "Huracán EVO Spyder",
        year: 2020,
        price: 259000,
        km: 11800,
        fuelType: "Benzin",
        transmission: "Automatik",
        vehicleType: "Cabrio",
        location: "München",
        description:
          "Lamborghini Huracán EVO Spyder in Arancio Borealis. 640 PS V10-Saugmotor, Lifting-System, Kamerapaket, individuelles Innenraum-Paket.",
        color: "Arancio Borealis",
        power: 640,
        doors: 2,
        seats: 2,
        condition: "used",
        featured: true,
        dealerId: dealer1.id,
        views: 528,
      },
      {
        title: "Tesla Model S Plaid – Long Range",
        brand: "Tesla",
        model: "Model S Plaid",
        year: 2023,
        price: 129900,
        km: 3400,
        fuelType: "Elektro",
        transmission: "Automatik",
        vehicleType: "Limousine",
        location: "Frankfurt",
        description:
          "Tesla Model S Plaid mit 1020 PS und über 600 km Reichweite. Autopilot, Premium Audio, 21-Zoll Arachnid-Räder, Glas-Panoramadach.",
        color: "Pearl White Multi-Coat",
        power: 1020,
        doors: 4,
        seats: 5,
        condition: "used",
        featured: false,
        dealerId: dealer2.id,
        views: 293,
      },
      {
        title: "Range Rover Sport SVR – Carbon Edition",
        brand: "Land Rover",
        model: "Range Rover Sport SVR",
        year: 2022,
        price: 138500,
        km: 22000,
        fuelType: "Benzin",
        transmission: "Automatik",
        vehicleType: "SUV",
        location: "Stuttgart",
        description:
          "Range Rover Sport SVR mit 575 PS Kompressor-V8. Carbon-Exterieur-Paket, Meridian Surround Sound, konfigurierbares Fahrwerk.",
        color: "Santorini Schwarz",
        power: 575,
        doors: 5,
        seats: 5,
        condition: "used",
        featured: false,
        dealerId: dealer3.id,
        views: 157,
      },
      {
        title: "Ferrari Roma – Daytona Stühle",
        brand: "Ferrari",
        model: "Roma",
        year: 2021,
        price: 248000,
        km: 8900,
        fuelType: "Benzin",
        transmission: "Automatik",
        vehicleType: "Sportwagen",
        location: "München",
        description:
          "Ferrari Roma in Bianco Italia. Daytona-Sportsitze, JBL Professional Soundsystem, Carbon-Fahrwerk, Pedalerie in Aluminium.",
        color: "Bianco Italia",
        power: 620,
        doors: 2,
        seats: 4,
        condition: "used",
        featured: false,
        dealerId: dealer1.id,
        views: 445,
      },
    ])
    .returning();

  console.log("Vehicles seeded:", vehicles.length);

  await db.insert(inquiriesTable).values([
    {
      vehicleId: vehicles[0].id,
      userId: user1.id,
      dealerId: dealer1.id,
      senderName: "Max Mustermann",
      senderEmail: "max@example.com",
      senderPhone: "+49 151 12345678",
      message:
        "Guten Tag, ich interessiere mich für den Porsche 911 Carrera S. Ist eine Probefahrt möglich?",
      status: "new",
    },
    {
      vehicleId: vehicles[1].id,
      userId: user2.id,
      dealerId: dealer2.id,
      senderName: "Anna Schmidt",
      senderEmail: "anna@example.com",
      message:
        "Hallo, können Sie mir mehr Details zum BMW M3 mitteilen? Ist der Preis verhandelbar?",
      status: "replied",
    },
    {
      vehicleId: vehicles[2].id,
      userId: user1.id,
      dealerId: dealer3.id,
      senderName: "Max Mustermann",
      senderEmail: "max@example.com",
      message:
        "Ich möchte den Mercedes GLE besichtigen. Wann haben Sie einen Termin frei?",
      status: "new",
    },
    {
      vehicleId: vehicles[4].id,
      dealerId: dealer1.id,
      senderName: "Klaus Weber",
      senderEmail: "k.weber@email.de",
      message:
        "Ist der Huracán noch verfügbar? Ich würde gerne ein Angebot machen.",
      status: "new",
    },
  ]);

  console.log("Inquiries seeded");

  await db.insert(favoritesTable).values([
    { userId: user1.id, vehicleId: vehicles[0].id },
    { userId: user1.id, vehicleId: vehicles[2].id },
    { userId: user1.id, vehicleId: vehicles[4].id },
    { userId: user2.id, vehicleId: vehicles[1].id },
    { userId: user2.id, vehicleId: vehicles[5].id },
  ]);

  console.log("Favorites seeded");
  console.log("Done!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
