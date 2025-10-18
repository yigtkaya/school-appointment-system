import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { TeacherCreateForm } from './TeacherCreateForm'
import { TeacherEditForm } from './TeacherEditForm'
import type { Teacher } from '@/types/api'
import { useTeachers, useDeleteTeacher } from '@/hooks'

export function TeacherManagement() {
  const { data: teachers, isLoading, error } = useTeachers()
  const deleteTeacherMutation = useDeleteTeacher()
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)

  const handleDeleteTeacher = (teacher: Teacher) => {
    if (confirm(`Are you sure you want to delete ${teacher.user?.full_name}?`)) {
      deleteTeacherMutation.mutate(parseInt(teacher.id as unknown as string))
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Loading teachers...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">
            Error loading teachers: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Teacher Management</CardTitle>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teachers?.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium text-lg">
                        {teacher.user?.full_name || 'No name'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {teacher.user?.email}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">{teacher.subject}</Badge>
                        {teacher.branch && (
                          <Badge variant="outline">{teacher.branch}</Badge>
                        )}
                        <Badge 
                          variant={teacher.user?.is_active ? "default" : "destructive"}
                        >
                          {teacher.user?.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {teacher.bio && (
                        <div className="text-sm text-gray-500 mt-2 max-w-md">
                          {teacher.bio}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTeacher(teacher)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTeacher(teacher)}
                    disabled={deleteTeacherMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            
            {(!teachers || teachers.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No teachers found. Add a teacher to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Teacher Form */}
      {showCreateForm && (
        <TeacherCreateForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
          }}
        />
      )}

      {/* Edit Teacher Form */}
      {editingTeacher && (
        <TeacherEditForm
          teacher={editingTeacher}
          onClose={() => setEditingTeacher(null)}
          onSuccess={() => {
            setEditingTeacher(null)
          }}
        />
      )}
    </div>
  )
}