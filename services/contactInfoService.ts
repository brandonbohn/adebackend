import ContactInfoModel from '../models/contactinfo';

export interface ContactUpsert {
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: string;
}

export async function upsertContactInfo(payload: ContactUpsert) {
  const { name, email, phone, country, address } = payload;
  const query: any = {};
  if (email) query.email = email.toLowerCase().trim();
  if (!query.email && phone) query.phone = String(phone).trim();
  if (!query.email && !query.phone) query.name = name;

  const update: any = {
    name,
    ...(email ? { email: email.toLowerCase().trim() } : {}),
    ...(phone ? { phone: String(phone).trim() } : {}),
    ...(country ? { country } : {}),
    ...(address ? { address } : {}),
  };

  const contact = await ContactInfoModel.findOneAndUpdate(
    query,
    { $set: update },
    { upsert: true, new: true }
  );
  return contact;
}
