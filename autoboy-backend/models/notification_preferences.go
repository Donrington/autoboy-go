package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// NotificationPreferences represents user notification preferences
type NotificationPreferences struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID             primitive.ObjectID `bson:"user_id" json:"user_id"`
	EmailNotifications bool               `bson:"email_notifications" json:"email_notifications"`
	PushNotifications  bool               `bson:"push_notifications" json:"push_notifications"`
	SMSNotifications   bool               `bson:"sms_notifications" json:"sms_notifications"`
	OrderUpdates       bool               `bson:"order_updates" json:"order_updates"`
	PriceAlerts        bool               `bson:"price_alerts" json:"price_alerts"`
	Promotions         bool               `bson:"promotions" json:"promotions"`
	NewMessages        bool               `bson:"new_messages" json:"new_messages"`
	CreatedAt          time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt          time.Time          `bson:"updated_at" json:"updated_at"`
}