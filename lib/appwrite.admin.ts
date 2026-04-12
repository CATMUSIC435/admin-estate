import { Client as NodeClient, Databases as NodeDatabases, Users as NodeUsers } from 'node-appwrite';

/**
 * CẤU HÌNH APPWRITE ADMIN SDK (Dành cho Server-side API Routes / Server Actions)
 * Sử dụng API Key siêu quyền lực để Server tương tác vượt quyền (Bypass permission).
 */

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "REPLACE_WITH_YOUR_PROJECT_ID";

// CHÚ Ý: Đây là Server Key, TUYỆT ĐỐI không dùng prefix NEXT_PUBLIC_ để tránh rò rỉ ra Frontend
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || "standard_d1879916ed2dc932de872cbd3d0cf7e1796e8564fa6f87d1f23150ec9dee5180b8116545154b771b7026a8431590cabdc22aa7022800519e8be691986734b699211b1870b0fa4d3ea36fd42edd1a4319dd4fad44c606cb1c97c6e9cd133919b0bc407a8fbdaac40f78014c53553e1cf5626790d324565911a249932c862a76bd";

export function createAdminClient() {
  const client = new NodeClient()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  return {
    get users() {
      return new NodeUsers(client);
    },
    get databases() {
      return new NodeDatabases(client);
    }
  };
}
