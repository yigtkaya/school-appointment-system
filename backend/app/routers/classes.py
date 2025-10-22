from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.class_model import Class
from app.models.student import Student
from app.models.teacher_class import TeacherClass
from app.models.user import User
from app.schemas.class_student import (
    ClassCreate,
    ClassResponse,
    StudentCreate,
    StudentResponse,
    TeacherClassCreate,
    TeacherClassResponse,
)
from app.core.dependencies import get_current_admin, get_current_teacher

router = APIRouter(prefix="/api", tags=["classes", "students"])


# ==================== Classes ====================

@router.get("/classes", response_model=List[ClassResponse])
async def list_classes(db: Session = Depends(get_db)):
    """List all classes."""
    classes = db.query(Class).all()
    return classes


@router.post("/classes", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
async def create_class(
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


@router.get("/classes/{class_id}", response_model=ClassResponse)
async def get_class(class_id: int, db: Session = Depends(get_db)):
    """Get a specific class."""
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    return class_obj


# ==================== Students ====================

@router.get("/classes/{class_id}/students", response_model=List[StudentResponse])
async def list_students_in_class(class_id: int, db: Session = Depends(get_db)):
    """List students in a specific class."""
    # Verify class exists
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    
    students = db.query(Student).filter(Student.class_id == class_id).all()
    return students


@router.post("/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
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


@router.get("/students/{student_id}", response_model=StudentResponse)
async def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get a specific student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    return student


# ==================== Teacher-Class Relationships ====================

@router.get("/classes/{class_id}/teachers", response_model=List[dict])
async def list_teachers_in_class(class_id: int, db: Session = Depends(get_db)):
    """List teachers teaching a specific class."""
    # Verify class exists
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    
    teacher_classes = db.query(TeacherClass).filter(
        TeacherClass.class_id == class_id
    ).all()
    
    result = []
    for tc in teacher_classes:
        result.append({
            "id": tc.teacher.id,
            "name": tc.teacher.name,
            "email": tc.teacher.email,
            "branch": tc.teacher.branch,
        })
    return result


@router.post("/teacher-classes", response_model=TeacherClassResponse, status_code=status.HTTP_201_CREATED)
async def assign_teacher_to_class(
    data: TeacherClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Assign a teacher to a class (admin only)."""
    # Verify teacher exists
    teacher = db.query(User).filter(User.id == data.teacher_id).first()
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher not found",
        )
    
    # Verify class exists
    class_obj = db.query(Class).filter(Class.id == data.class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    
    # Check if relationship already exists
    existing = db.query(TeacherClass).filter(
        TeacherClass.teacher_id == data.teacher_id,
        TeacherClass.class_id == data.class_id,
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teacher is already assigned to this class",
        )
    
    new_tc = TeacherClass(teacher_id=data.teacher_id, class_id=data.class_id)
    db.add(new_tc)
    db.commit()
    db.refresh(new_tc)
    return new_tc


# ==================== Teacher Student Management ====================

@router.get("/teacher/classes", response_model=List[ClassResponse])
async def get_teacher_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Get all classes assigned to current teacher."""
    teacher_classes = db.query(TeacherClass).filter(
        TeacherClass.teacher_id == current_user.id
    ).all()
    
    classes = [tc.class_ for tc in teacher_classes]
    return classes


@router.get("/teacher/classes/{class_id}/students", response_model=List[StudentResponse])
async def get_teacher_class_students(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Get students in a class taught by current teacher."""
    # Verify teacher is assigned to this class
    tc = db.query(TeacherClass).filter(
        TeacherClass.teacher_id == current_user.id,
        TeacherClass.class_id == class_id,
    ).first()
    
    if not tc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to this class",
        )
    
    students = db.query(Student).filter(Student.class_id == class_id).all()
    return students


@router.get("/teacher/students/available", response_model=List[StudentResponse])
async def get_all_available_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Get all students (for combobox selection across all classes)."""
    students = db.query(Student).all()
    return students


@router.post("/teacher/classes/{class_id}/students/{student_id}", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def add_student_to_teacher_class(
    class_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Add an existing student to a class (teacher must be assigned to class)."""
    # Verify teacher is assigned to this class
    tc = db.query(TeacherClass).filter(
        TeacherClass.teacher_id == current_user.id,
        TeacherClass.class_id == class_id,
    ).first()
    
    if not tc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to this class",
        )
    
    # Verify student exists
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    
    # Verify class exists
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    
    # Update student's class
    student.class_id = class_id
    db.commit()
    db.refresh(student)
    return student


@router.post("/teacher/students", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_and_add_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Create a new student and add to a class (teacher must be assigned to class)."""
    # Verify teacher is assigned to this class
    tc = db.query(TeacherClass).filter(
        TeacherClass.teacher_id == current_user.id,
        TeacherClass.class_id == student_data.class_id,
    ).first()
    
    if not tc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to this class",
        )
    
    # Verify class exists
    class_obj = db.query(Class).filter(Class.id == student_data.class_id).first()
    if not class_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class not found",
        )
    
    # Create new student
    new_student = Student(name=student_data.name, class_id=student_data.class_id)
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student


@router.delete("/teacher/classes/{class_id}/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_student_from_teacher_class(
    class_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    """Remove a student from a class (teacher must be assigned to class)."""
    # Verify teacher is assigned to this class
    tc = db.query(TeacherClass).filter(
        TeacherClass.teacher_id == current_user.id,
        TeacherClass.class_id == class_id,
    ).first()
    
    if not tc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to this class",
        )
    
    # Verify student exists and belongs to this class
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.class_id == class_id,
    ).first()
    
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found in this class",
        )
    
    db.delete(student)
    db.commit()

