import PocketBase from 'pocketbase';

export const pb = new PocketBase(
  process.env.NEXT_PUBLIC_PB_URL ?? 'https://z4vu9pzwoklnupf.ba7w.pocketbasecloud.com'
);
