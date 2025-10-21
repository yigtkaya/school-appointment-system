from pydantic import BaseModel
from typing import Optional


class ClassBase(BaseModel):
    """Base class schema."""
    grade: int
    section: str


class ClassCreate(ClassBase):
    """Schema for creating a class."""
    pass


class ClassResponse(ClassBase):
    """Schema for class response."""
    id: int
    
    class Config:
        from_attributes = True


class StudentBase(BaseModel):
    """Base student schema."""
    name: str
    class_id: int


class StudentCreate(StudentBase):
    """Schema for creating a student."""
    pass


class StudentResponse(StudentBase):
    """Schema for student response."""
    id: int
    
    class Config:
        from_attributes = True


class TeacherClassBase(BaseModel):
    """Base teacher-class schema."""
    teacher_id: int
    class_id: int


class TeacherClassCreate(TeacherClassBase):
    """Schema for creating a teacher-class relationship."""
    pass


class TeacherClassResponse(TeacherClassBase):
    """Schema for teacher-class response."""
    id: int
    
    class Config:
        from_attributes = True
