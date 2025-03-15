import { ObjectId } from 'mongodb';

export interface INotification {
  _id?: ObjectId;
  recipient: ObjectId;
  sender?: ObjectId;
  type: 'reply' | 'mention' | 'like' | 'topic_reply' | 'role_change' | 'system';
  content: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Export the Notification class that would normally be created by mongoose
export class Notification implements INotification {
  _id?: ObjectId;
  recipient: ObjectId;
  sender?: ObjectId;
  type: 'reply' | 'mention' | 'like' | 'topic_reply' | 'role_change' | 'system';
  content: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt?: Date;

  constructor(data: {
    recipient: string | ObjectId;
    sender?: string | ObjectId;
    type: 'reply' | 'mention' | 'like' | 'topic_reply' | 'role_change' | 'system';
    content: string;
    link?: string;
    read: boolean;
  }) {
    this.recipient = typeof data.recipient === 'string' ? new ObjectId(data.recipient) : data.recipient;
    
    if (data.sender) {
      this.sender = typeof data.sender === 'string' ? new ObjectId(data.sender) : data.sender;
    }
    
    this.type = data.type;
    this.content = data.content;
    this.link = data.link;
    this.read = data.read;
    this.createdAt = new Date();
  }

  // Mock the mongoose save method
  async save(): Promise<INotification> {
    // This would normally save to MongoDB, but we'll implement it in the service
    return this;
  }

  // Static methods to match mongoose functionality
  static async findById(id: string | ObjectId): Promise<INotification | null> {
    // This is just a stub - actual implementation would be in the service
    return null;
  }

  static async find(query: any): Promise<INotification[]> {
    // This is just a stub - actual implementation would be in the service
    return [];
  }

  static async countDocuments(query: any): Promise<number> {
    // This is just a stub - actual implementation would be in the service
    return 0;
  }

  static async updateMany(query: any, update: any): Promise<{modifiedCount: number}> {
    // This is just a stub - actual implementation would be in the service
    return {modifiedCount: 0};
  }

  static async deleteOne(query: any): Promise<{deletedCount: number}> {
    // This is just a stub - actual implementation would be in the service
    return {deletedCount: 0};
  }

  static async deleteMany(query: any): Promise<{deletedCount: number}> {
    // This is just a stub - actual implementation would be in the service
    return {deletedCount: 0};
  }

  // Mock method for populate
  static populate(field: string, select: string): any {
    // This would normally populate references
    return this;
  }

  // Mock method for lean
  static lean(): any {
    // This would normally convert to plain objects
    return this;
  }
} 