import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking and seeding vehicles...');

  const vehicles = [
    {
      make: 'Tesla',
      model: 'Model S Plaid',
      category: 'Electric',
      price: 89990,
      quantity: 3,
    },
    {
      make: 'Porsche',
      model: '911 Carrera',
      category: 'Coupe',
      price: 114400,
      quantity: 2,
    },
    {
      make: 'Ford',
      model: 'F-150 Lightning',
      category: 'Electric',
      price: 54995,
      quantity: 5,
    },
    {
      make: 'Honda',
      model: 'Civic Type R',
      category: 'Hatchback',
      price: 43795,
      quantity: 2,
    },
    {
      make: 'Toyota',
      model: 'RAV4 Hybrid',
      category: 'SUV',
      price: 31725,
      quantity: 8,
    },
    {
      make: 'BMW',
      model: 'M4 Competition',
      category: 'Coupe',
      price: 78100,
      quantity: 1,
    },
    {
      make: 'Chevrolet',
      model: 'Silverado 1500',
      category: 'Truck',
      price: 36800,
      quantity: 4,
    },
    {
      make: 'Audi',
      model: 'A4 Sedan',
      category: 'Sedan',
      price: 41200,
      quantity: 6,
    },
    {
      make: 'Mazda',
      model: 'MX-5 Miata',
      category: 'Convertible',
      price: 28980,
      quantity: 0,
    },
    {
      make: 'Mercedes-Benz',
      model: 'G-Class',
      category: 'SUV',
      price: 140000,
      quantity: 3,
    },
    {
      make: 'Lamborghini',
      model: 'Huracan',
      category: 'Coupe',
      price: 260000,
      quantity: 1,
    },
    {
      make: 'BMW',
      model: 'i8',
      category: 'Electric',
      price: 147000,
      quantity: 2,
    },
    {
      make: 'Subaru',
      model: 'WRX STI',
      category: 'Sedan',
      price: 38000,
      quantity: 4,
    },
    {
      make: 'Jeep',
      model: 'Wrangler',
      category: 'SUV',
      price: 45000,
      quantity: 5,
    },
  ];

  let addedCount = 0;

  for (const vehicle of vehicles) {
    const existing = await prisma.vehicle.findFirst({
      where: {
        make: vehicle.make,
        model: vehicle.model,
      },
    });

    if (!existing) {
      await prisma.vehicle.create({
        data: vehicle,
      });
      console.log(`+ Seeded: ${vehicle.make} ${vehicle.model}`);
      addedCount++;
    }
  }

  console.log(`Database seeding check complete! Added ${addedCount} new vehicles.`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
