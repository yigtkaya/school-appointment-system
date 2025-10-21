from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.models.user import User
from app.models.appointment import Appointment
from app.models.class_model import Class
from app.models.student import Student
from app.models.teacher_class import TeacherClass
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.class_student import ClassCreate, ClassResponse, StudentCreate, StudentResponse
from app.schemas.appointment import AppointmentResponse
from app.core.security import get_password_hash, verify_password
from app.core.dependencies import get_current_admin, UserRole

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ==================== Teacher Management ====================

@router.get("/teachers", response_model=List[UserResponse])
async def list_teachers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """List all teachers (admin only)."""
    teachers = db.query(User).filter(User.role == UserRole.TEACHER).all()
    return teachers


@router.post("/teachers", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_teacher(
    teacher_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create a new teacher account (admin only)."""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == teacher_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new teacher
    hashed_password = get_password_hash(teacher_data.password)
    new_teacher = User(
        name=teacher_data.name,
        email=teacher_data.email,
        password_hash=hashed_password,
        branch=teacher_data.branch,
        role=UserRole.TEACHER,
    )
    
    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)
    
    return new_teacher


@router.get("/teachers/{teacher_id}", response_model=UserResponse)
async def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get a specific teacher (admin only)."""
    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == UserRole.TEACHER,
    ).first()
    
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    return teacher


@router.put("/teachers/{teacher_id}", response_model=UserResponse)
async def update_teacher(
    teacher_id: int,
    teacher_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update teacher information (admin only)."""
    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == UserRole.TEACHER,
    ).first()
    
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    if teacher_data.name:
        teacher.name = teacher_data.name
    if teacher_data.branch:
        teacher.branch = teacher_data.branch
    if teacher_data.password:
        teacher.password_hash = get_password_hash(teacher_data.password)
    
    db.commit()
    db.refresh(teacher)
    return teacher


@router.delete("/teachers/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete a teacher account (admin only)."""
    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == UserRole.TEACHER,
    ).first()
    
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    # Delete associated data
    db.query(TeacherClass).filter(TeacherClass.teacher_id == teacher_id).delete()
    db.query(Appointment).filter(Appointment.teacher_id == teacher_id).delete()
    db.delete(teacher)
    db.commit()


@router.post("/teachers/{teacher_id}/approve", response_model=UserResponse)
async def approve_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Approve a teacher account (admin only)."""
    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == UserRole.TEACHER,
    ).first()
    
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    teacher.require_approval = False
    db.commit()
    db.refresh(teacher)
    return teacher


@router.post("/teachers/{teacher_id}/require-approval", response_model=UserResponse)
async def require_teacher_approval(
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Set teacher to require appointment approval (admin only)."""
    teacher = db.query(User).filter(
        User.id == teacher_id,
        User.role == UserRole.TEACHER,
    ).first()
    
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    teacher.require_approval = True
    db.commit()
    db.refresh(teacher)
    return teacher


# ==================== Class Management ====================

@router.post("/classes", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_class(
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create a new class (admin only)."""
    new_class = Class(grade=class_data.grade, section=class_data.section)
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class


@router.put("/classes/{class_id}", response_model=ClassResponse)
async def update_class(
    class_id: int,
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update class information (admin only)."""
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    
    class_obj.grade = class_data.grade
    class_obj.section = class_data.section
    
    db.commit()
    db.refresh(class_obj)
    return class_obj


@router.delete("/classes/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete a class (admin only)."""
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    
    # Delete associated data
    db.query(Student).filter(Student.class_id == class_id).delete()
    db.query(TeacherClass).filter(TeacherClass.class_id == class_id).delete()
    db.query(Appointment).filter(Appointment.class_id == class_id).delete()
    db.delete(class_obj)
    db.commit()


# ==================== Student Management ====================

@router.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create a new student (admin only)."""
    # Verify class exists
    class_obj = db.query(Class).filter(Class.id == student_data.class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    
    new_student = Student(name=student_data.name, class_id=student_data.class_id)
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student


@router.put("/students/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update student information (admin only)."""
    student = db.query(Student).filter(Student.id == student_id).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    
    # Verify new class exists
    if student_data.class_id != student.class_id:
        class_obj = db.query(Class).filter(Class.id == student_data.class_id).first()
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found",
            )
    
    student.name = student_data.name
    student.class_id = student_data.class_id
    
    db.commit()
    db.refresh(student)
    return student


@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete a student (admin only)."""
    student = db.query(Student).filter(Student.id == student_id).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    
    # Delete associated appointments
    db.query(Appointment).filter(Appointment.student_id == student_id).delete()
    db.delete(student)
    db.commit()


# ==================== Appointment Overview ====================

@router.get("/appointments", response_model=List[AppointmentResponse])
async def list_all_appointments(
    status: str = Query(None, description="Filter by status: pending, confirmed, cancelled, rejected"),
    teacher_id: int = Query(None, description="Filter by teacher ID"),
    class_id: int = Query(None, description="Filter by class ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """List all appointments with filtering (admin only)."""
    query = db.query(Appointment)
    
    if status:
        query = query.filter(Appointment.status == status)
    if teacher_id:
        query = query.filter(Appointment.teacher_id == teacher_id)
    if class_id:
        query = query.filter(Appointment.class_id == class_id)
    
    appointments = query.all()
    return appointments


@router.get("/appointments/stats", response_model=dict)
async def get_appointment_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get appointment statistics (admin only)."""
    total_appointments = db.query(Appointment).count()
    pending_appointments = db.query(Appointment).filter(
        Appointment.status == "pending"
    ).count()
    confirmed_appointments = db.query(Appointment).filter(
        Appointment.status == "confirmed"
    ).count()
    cancelled_appointments = db.query(Appointment).filter(
        Appointment.status == "cancelled"
    ).count()
    rejected_appointments = db.query(Appointment).filter(
        Appointment.status == "rejected"
    ).count()
    
    total_teachers = db.query(User).filter(User.role == UserRole.TEACHER).count()
    total_classes = db.query(Class).count()
    total_students = db.query(Student).count()
    
    return {
        "total_appointments": total_appointments,
        "pending_appointments": pending_appointments,
        "confirmed_appointments": confirmed_appointments,
        "cancelled_appointments": cancelled_appointments,
        "rejected_appointments": rejected_appointments,
        "total_teachers": total_teachers,
        "total_classes": total_classes,
        "total_students": total_students,
    }


@router.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment_details(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get detailed appointment information (admin only)."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    
    return appointment
