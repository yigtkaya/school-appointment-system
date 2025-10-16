"""Notification service for sending emails using Resend API."""

import logging
from typing import Optional, Dict, Any
from datetime import datetime, date, time
import resend
from app.core.config import get_settings
from app.core.constants import AppointmentStatus

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize Resend client
if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY


class EmailTemplate:
    """Email template generator for different notification types."""
    
    @staticmethod
    def appointment_booking_confirmation(
        parent_name: str,
        teacher_name: str,
        teacher_subject: str,
        appointment_date: str,
        appointment_time: str,
        student_name: str = None
    ) -> Dict[str, str]:
        """Generate appointment booking confirmation email."""
        subject = f"Appointment Confirmed - {teacher_name} ({teacher_subject})"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Appointment Confirmed ✓</h2>
            
            <p>Dear {parent_name},</p>
            
            <p>Your appointment has been successfully booked! Here are the details:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">Appointment Details</h3>
                <p><strong>Teacher:</strong> {teacher_name}</p>
                <p><strong>Subject:</strong> {teacher_subject}</p>
                <p><strong>Date:</strong> {appointment_date}</p>
                <p><strong>Time:</strong> {appointment_time}</p>
                {f'<p><strong>Student:</strong> {student_name}</p>' if student_name else ''}
            </div>
            
            <p>Please arrive on time for your appointment. If you need to cancel or reschedule, please contact us as soon as possible.</p>
            
            <p>Best regards,<br>
            School Appointment System</p>
        </div>
        """
        
        text_content = f"""
        Appointment Confirmed
        
        Dear {parent_name},
        
        Your appointment has been successfully booked!
        
        Teacher: {teacher_name}
        Subject: {teacher_subject}
        Date: {appointment_date}
        Time: {appointment_time}
        {f'Student: {student_name}' if student_name else ''}
        
        Please arrive on time for your appointment.
        
        Best regards,
        School Appointment System
        """
        
        return {
            "subject": subject,
            "html": html_content,
            "text": text_content
        }
    
    @staticmethod
    def appointment_cancellation(
        parent_name: str,
        teacher_name: str,
        teacher_subject: str,
        appointment_date: str,
        appointment_time: str,
        student_name: str = None
    ) -> Dict[str, str]:
        """Generate appointment cancellation email."""
        subject = f"Appointment Cancelled - {teacher_name} ({teacher_subject})"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Appointment Cancelled</h2>
            
            <p>Dear {parent_name},</p>
            
            <p>Your appointment has been cancelled. Here were the details:</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0; color: #374151;">Cancelled Appointment</h3>
                <p><strong>Teacher:</strong> {teacher_name}</p>
                <p><strong>Subject:</strong> {teacher_subject}</p>
                <p><strong>Date:</strong> {appointment_date}</p>
                <p><strong>Time:</strong> {appointment_time}</p>
                {f'<p><strong>Student:</strong> {student_name}</p>' if student_name else ''}
            </div>
            
            <p>If you need to book a new appointment, please visit our booking system.</p>
            
            <p>Best regards,<br>
            School Appointment System</p>
        </div>
        """
        
        text_content = f"""
        Appointment Cancelled
        
        Dear {parent_name},
        
        Your appointment has been cancelled.
        
        Cancelled Appointment Details:
        Teacher: {teacher_name}
        Subject: {teacher_subject}
        Date: {appointment_date}
        Time: {appointment_time}
        {f'Student: {student_name}' if student_name else ''}
        
        Best regards,
        School Appointment System
        """
        
        return {
            "subject": subject,
            "html": html_content,
            "text": text_content
        }
    
    @staticmethod
    def appointment_reminder(
        parent_name: str,
        teacher_name: str,
        teacher_subject: str,
        appointment_date: str,
        appointment_time: str,
        student_name: str = None
    ) -> Dict[str, str]:
        """Generate appointment reminder email."""
        subject = f"Reminder: Appointment Tomorrow - {teacher_name}"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Appointment Reminder 🔔</h2>
            
            <p>Dear {parent_name},</p>
            
            <p>This is a friendly reminder about your upcoming appointment:</p>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="margin-top: 0; color: #374151;">Tomorrow's Appointment</h3>
                <p><strong>Teacher:</strong> {teacher_name}</p>
                <p><strong>Subject:</strong> {teacher_subject}</p>
                <p><strong>Date:</strong> {appointment_date}</p>
                <p><strong>Time:</strong> {appointment_time}</p>
                {f'<p><strong>Student:</strong> {student_name}</p>' if student_name else ''}
            </div>
            
            <p>Please arrive on time. If you need to cancel or reschedule, please contact us as soon as possible.</p>
            
            <p>Best regards,<br>
            School Appointment System</p>
        </div>
        """
        
        text_content = f"""
        Appointment Reminder
        
        Dear {parent_name},
        
        This is a reminder about your appointment tomorrow:
        
        Teacher: {teacher_name}
        Subject: {teacher_subject}
        Date: {appointment_date}
        Time: {appointment_time}
        {f'Student: {student_name}' if student_name else ''}
        
        Please arrive on time.
        
        Best regards,
        School Appointment System
        """
        
        return {
            "subject": subject,
            "html": html_content,
            "text": text_content
        }
    
    @staticmethod
    def teacher_new_appointment(
        teacher_name: str,
        parent_name: str,
        appointment_date: str,
        appointment_time: str,
        student_name: str = None
    ) -> Dict[str, str]:
        """Generate new appointment notification for teacher."""
        subject = f"New Appointment Booked - {appointment_date}"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">New Appointment Booked 📅</h2>
            
            <p>Dear {teacher_name},</p>
            
            <p>A new appointment has been booked with you:</p>
            
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                <h3 style="margin-top: 0; color: #374151;">New Appointment</h3>
                <p><strong>Parent:</strong> {parent_name}</p>
                <p><strong>Date:</strong> {appointment_date}</p>
                <p><strong>Time:</strong> {appointment_time}</p>
                {f'<p><strong>Student:</strong> {student_name}</p>' if student_name else ''}
            </div>
            
            <p>Please confirm this appointment at your earliest convenience.</p>
            
            <p>Best regards,<br>
            School Appointment System</p>
        </div>
        """
        
        text_content = f"""
        New Appointment Booked
        
        Dear {teacher_name},
        
        A new appointment has been booked with you:
        
        Parent: {parent_name}
        Date: {appointment_date}
        Time: {appointment_time}
        {f'Student: {student_name}' if student_name else ''}
        
        Please confirm this appointment.
        
        Best regards,
        School Appointment System
        """
        
        return {
            "subject": subject,
            "html": html_content,
            "text": text_content
        }


class NotificationService:
    """Service for sending notifications via email."""
    
    def __init__(self):
        self.sender_email = settings.SENDER_EMAIL
        self.is_configured = bool(settings.RESEND_API_KEY)
        
        if not self.is_configured:
            logger.warning("Resend API key not configured. Email notifications will be logged only.")
    
    async def send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str, 
        text_content: str
    ) -> bool:
        """Send an email using Resend API."""
        if not self.is_configured:
            logger.info(f"Email would be sent to {to_email}: {subject}")
            logger.debug(f"Email content: {text_content}")
            return True
        
        try:
            params = {
                "from": self.sender_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
                "text": text_content,
            }
            
            r = resend.Emails.send(params)
            logger.info(f"Email sent successfully to {to_email}. ID: {r.get('id')}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    async def send_appointment_confirmation(
        self,
        parent_email: str,
        parent_name: str,
        teacher_name: str,
        teacher_subject: str,
        appointment_date: str,
        appointment_time: str,
        student_name: str = None
    ) -> bool:
        """Send appointment booking confirmation email to parent."""
        template = EmailTemplate.appointment_booking_confirmation(
            parent_name=parent_name,
            teacher_name=teacher_name,
            teacher_subject=teacher_subject,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            student_name=student_name
        )
        
        return await self.send_email(
            to_email=parent_email,
            subject=template["subject"],
            html_content=template["html"],
            text_content=template["text"]
        )
    
    async def send_appointment_cancellation(
        self,
        parent_email: str,
        parent_name: str,
        teacher_name: str,
        teacher_subject: str,
        appointment_date: str,
        appointment_time: str,
        student_name: str = None
    ) -> bool:
        """Send appointment cancellation email to parent."""
        template = EmailTemplate.appointment_cancellation(
            parent_name=parent_name,
            teacher_name=teacher_name,
            teacher_subject=teacher_subject,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            student_name=student_name
        )
        
        return await self.send_email(
            to_email=parent_email,
            subject=template["subject"],
            html_content=template["html"],
            text_content=template["text"]
        )
    
    async def send_appointment_reminder(
        self,
        parent_email: str,
        parent_name: str,
        teacher_name: str,
        teacher_subject: str,
        appointment_date: str,
        appointment_time: str,
        student_name: str = None
    ) -> bool:
        """Send appointment reminder email to parent."""
        template = EmailTemplate.appointment_reminder(
            parent_name=parent_name,
            teacher_name=teacher_name,
            teacher_subject=teacher_subject,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            student_name=student_name
        )
        
        return await self.send_email(
            to_email=parent_email,
            subject=template["subject"],
            html_content=template["html"],
            text_content=template["text"]
        )
    
    async def send_teacher_notification(
        self,
        teacher_email: str,
        teacher_name: str,
        parent_name: str,
        appointment_date: str,
        appointment_time: str,
        student_name: str = None
    ) -> bool:
        """Send new appointment notification to teacher."""
        template = EmailTemplate.teacher_new_appointment(
            teacher_name=teacher_name,
            parent_name=parent_name,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            student_name=student_name
        )
        
        return await self.send_email(
            to_email=teacher_email,
            subject=template["subject"],
            html_content=template["html"],
            text_content=template["text"]
        )


# Global notification service instance
notification_service = NotificationService()