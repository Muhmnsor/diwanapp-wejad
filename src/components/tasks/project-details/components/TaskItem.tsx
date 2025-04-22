import React, { useState, useEffect } from "react";
import { Calendar, Users, Check, Clock, ChevronDown, ChevronUp, MessageCircle, Download, Trash2, Edit } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { SubtasksList } from "./subtasks/SubtasksList";
import { checkPendingSubtasks } from "../services/subtasksService";
import { TaskDiscussionDialog } from "../../components/TaskDiscussionDialog";
import { TaskDependenciesDialog } from "./dependencies/TaskDependenciesDialog";
import { usePermissionCheck } from "../hooks/usePermissionCheck";
import { DependencyIcon } from "../../components/dependencies/DependencyIcon";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskDependencyManager } from "../../components/dependencies/TaskDependencyManager";
// import { useTaskDependencies } from "../hooks/useTaskDependencies"; // تم استبدال الاستخدام بالهوك الجديد
import { useTaskStatusManagement } from "../hooks/useTaskStatusManagement"; // إضافة جديدة

// 1. إضافة هذه ال Props في تعريف المكون
export const TaskItem = ({
    task,
    getStatusBadge,
    getPriorityBadge,
    formatDate,
    // onStatusChange, // تم إزالة هذا الـ prop حيث أن الهوك الجديد سيتولى إدارة الحالة وتحديثها
    projectId,
    onEdit,
    onDelete,
    tasks,                    // إضافة جديدة
    setTasks,                 // إضافة جديدة
    tasksByStage,            // إضافة جديدة
    setTasksByStage          // إضافة جديدة
}) => {
    // تم إزالة حالة isUpdating المحلية، سيتم استخدام الحالة من الهوك
    // const [isUpdating, setIsUpdating] = useState(false);
    const [showSubtasks, setShowSubtasks] = useState(false);
    const [showDiscussion, setShowDiscussion] = useState(false);
    const [showDependencies, setShowDependencies] = useState(false);
    const [assigneeAttachment, setAssigneeAttachment] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [hasNewDiscussion, setHasNewDiscussion] = useState(false);
    const [hasDeliverables, setHasDeliverables] = useState(false);


    const { user } = useAuthStore();

    // تم استبدال الهوك القديم بالهوك الجديد لإدارة حالة المهمة
    // const { checkDependenciesCompleted } = useTaskDependencies(task.id); // تم إزالة هذا الاستخدام المباشر

    // 2. استخدام الhook في أعلى المكون (بعد تعريف المتغيرات مباشرة)
    const { handleStatusChange: manageTaskStatus, isUpdating } = useTaskStatusManagement(
        projectId,
        tasks,
        setTasks,
        tasksByStage,
        setTasksByStage
    );

     // استخدام الهوك لإدارة الاعتماديات (تم نقله للأعلى ليكون استخدام هوك صحيح)
    const {
        hasDependencies,
        hasDependents,
        hasPendingDependencies,
        checkDependenciesCompleted // الحصول على الدالة من استخدام الهوك هنا
    } = useTaskDependencyManager({ taskId: task.id });


    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: task.id
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const { canEdit } = usePermissionCheck({
        assignedTo: null, // قد تحتاج لتغيير هذا حسب منطق الصلاحيات الفعلي إذا كان يعتمد على assigned_to
        projectId: task.project_id,
        workspaceId: task.workspace_id,
        createdBy: task.created_by,
        isGeneral: task.is_general,
        projectManager: task.project_manager
    });

    useEffect(() => {
        if (task.assigned_to) {
            fetchAssigneeAttachment();
        }
         // تم نقل تحديث hasDeliverables ليتم داخل fetchAssigneeAttachment بعد جلب البيانات
        // setHasDeliverables(!!assigneeAttachment);
    }, [task.id, task.assigned_to]); // تم إزالة assigneeAttachment من الاعتماديات لتجنب حلقة لا نهائية محتملة

    const fetchAssigneeAttachment = async () => {
        try {
            const { data: portfolioAttachments, error: portfolioError } = await supabase
                .from("portfolio_task_attachments")
                .select("*")
                .eq("task_id", task.id)
                .eq("created_by", task.assigned_to)
                .order('created_at', { ascending: false })
                .limit(1);

            const { data: taskAttachments, error: taskError } = await supabase
                .from("task_attachments")
                .select("*")
                .eq("task_id", task.id)
                .eq("created_by", task.assigned_to)
                .order('created_at', { ascending: false })
                .limit(1);

            if ((portfolioAttachments && portfolioAttachments.length > 0) || (taskAttachments && taskAttachments.length > 0)) {
                const attachment = portfolioAttachments?.length > 0 ? portfolioAttachments[0] : taskAttachments[0];
                setAssigneeAttachment(attachment);
                setHasDeliverables(true); // تم تحديث الحالة هنا
            } else {
                 setAssigneeAttachment(null); // تأكد من تعيينها إلى null إذا لم يتم العثور على مرفقات
                setHasDeliverables(false); // تم تحديث الحالة هنا
            }
        } catch (error) {
            console.error("Error fetching assignee attachment:", error);
             setAssigneeAttachment(null); // تأكد من تعيينها إلى null عند الخطأ
             setHasDeliverables(false); // تم تحديث الحالة هنا
        }
    };

    const handleDownload = (fileUrl, fileName) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.target = '_blank';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async () => {
        if (!onDelete || !canEdit) {
            if (!canEdit) {
                toast.error("ليس لديك صلاحية لحذف هذه المهمة");
            }
            return;
        }

        setIsDeleting(true);
        try {
            // نفترض أن onDelete يتعامل مع تحديث الواجهة الخلفية والأمامية
            await onDelete(task.id); // أضفنا await بافتراض أن onDelete عملية غير متزامنة
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("حدث خطأ أثناء حذف المهمة");
        } finally {
            setIsDeleting(false);
        }
    };

    const resetDiscussionFlag = () => {
        setHasNewDiscussion(false);
    };

    // 3. تعديل دالة handleStatusUpdate لتستخدم handleStatusChange الجديدة من الهوك
    const handleStatusUpdate = async (newStatus) => {
        if (!canEdit) {
            toast.error("ليس لديك صلاحية لتغيير حالة هذه المهمة");
            return;
        }

        // الفحوصات المسبقة (المهام الفرعية، المستلمات، الاعتماديات) تتم فقط عند محاولة إكمال المهمة
        if (newStatus === 'completed') {
             // التحقق من المهام الفرعية المعلقة
            const { hasPendingSubtasks, error: subtaskCheckError } = await checkPendingSubtasks(task.id);

            if (subtaskCheckError) {
                 toast.error(subtaskCheckError);
                // لا نوقف التنفيذ هنا، الهوك سيتعامل مع حالة التحميل
                return; // العودة إذا كان هناك خطأ في جلب المهام الفرعية
            }

            if (hasPendingSubtasks) {
                toast.error("لا يمكن إكمال المهمة حتى يتم إكمال جميع المهام الفرعية");
                // لا نوقف التنفيذ هنا، الهوك سيتعامل مع حالة التحميل
                return; // العودة إذا كانت هناك مهام فرعية معلقة
            }

             // التحقق من المستلمات إذا كانت إلزامية
            if (task.requires_deliverable && !hasDeliverables) {
                toast.error("لا يمكن إكمال المهمة. المستلمات إلزامية لهذه المهمة", {
                    description: "يرجى رفع مستلم واحد على الأقل قبل إكمال المهمة",
                    duration: 5000
                });
                // لا نوقف التنفيذ هنا، الهوك سيتعامل مع حالة التحميل
                return; // العودة إذا كانت المستلمات إلزامية ولم يتم رفعها
            }

            // التحقق من الاعتماديات باستخدام الدالة التي تم الحصول عليها من الهوك المعرف في الأعلى
            const dependencyCheck = await checkDependenciesCompleted(task.id);

            if (!dependencyCheck.isValid) {
                toast.error(dependencyCheck.message);
                if (dependencyCheck.pendingDependencies.length > 0) {
                    const pendingTasks = dependencyCheck.pendingDependencies.map(task => task.title).join(", ");
                    // قد ترغب في دمج هذا التوست مع السابق أو تعديل الرسالة
                    toast.error(`المهام المعلقة: ${pendingTasks}`);
                }
                // لا نوقف التنفيذ هنا، الهوك سيتعامل مع حالة التحميل
                return; // العودة إذا كانت هناك اعتماديات معلقة
            }
        }

        // إذا مرت جميع الفحوصات (أو إذا كانت الحالة الجديدة ليست 'completed')
        // يتم استدعاء الدالة من الهوك الجديد لإدارة تحديث الحالة
        // الهوك هو المسؤول عن تعيين حالة isUpdating، التفاعل مع الواجهة الخلفية، وتحديث حالات tasks و tasksByStage
        try {
             await manageTaskStatus(task.id, newStatus); // نمرر كائن المهمة بالكامل إذا كان الهوك يحتاجه
             // لا حاجة لتعيين setIsUpdating(false) هنا، الهوك هو من يديرها
        } catch (error) {
            // من المفترض أن يتعامل الهوك مع أخطائه وتوستاته داخلياً، ولكن هذه كآلية احتياطية
            console.error("Error during status update via hook:", error);
            // قد تحتاج لإضافة توست هنا إذا كان الهوك لا يتعامل مع الأخطاء بشكل جيد
             toast.error("حدث خطأ غير متوقع أثناء تحديث حالة المهمة.");
        }
    };


    // استخدام حالة isUpdating من الهوك لتعطيل الأزرار
    const renderStatusChangeButton = () => {
        if (!canEdit) {
            return null;
        }

        return task.status !== 'completed' ? (
            <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 ml-1"
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating} // استخدم isUpdating من الهوك
                title="إكمال المهمة"
            >
                <Check className="h-3.5 w-3.5 text-green-500" />
            </Button>
        ) : (
            <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 ml-1"
                onClick={() => handleStatusUpdate('in_progress')}
                disabled={isUpdating} // استخدم isUpdating من الهوك
                title="إعادة فتح المهمة"
            >
                <Clock className="h-3.5 w-3.5 text-amber-500" />
            </Button>
        );
    };

    const handleShowDiscussion = () => {
        resetDiscussionFlag();
        setShowDiscussion(true);
    };

    // hasDependencies, hasDependents, hasPendingDependencies يتم الحصول عليها من الهوك المعرف في الأعلى

    return (
        <>
            <TableRow
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
            >
                <TableCell className="font-medium flex items-center">
                    {task.title}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-7 w-7 ml-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowSubtasks(!showSubtasks);
                        }}
                        title={showSubtasks ? "إخفاء المهام الفرعية" : "عرض المهام الفرعية"}
                    >
                        {showSubtasks ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`p-0 h-7 w-7 ${hasDependencies || hasDependents ? 'bg-gray-50 hover:bg-gray-100' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowDependencies(true);
                        }}
                        title="إدارة اعتماديات المهمة"
                    >
                        <DependencyIcon
                            hasDependencies={hasDependencies}
                            hasPendingDependencies={hasPendingDependencies}
                            hasDependents={hasDependents}
                            size={16}
                        />
                    </Button>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                        {renderStatusChangeButton()} {/* يستخدم isUpdating من الهوك */}
                    </div>
                </TableCell>
                <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                <TableCell>
                    {task.assigned_user_name ? (
                        <div className="flex items-center">
                            <Users className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
                            {task.assigned_user_name}
                        </div>
                    ) : (
                        <span className="text-gray-400">غير محدد</span>
                    )}
                </TableCell>
                <TableCell>
                    <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
                        {formatDate(task.due_date)}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`p-0 h-7 w-7 ${hasNewDiscussion ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50" : "text-muted-foreground hover:text-foreground"}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleShowDiscussion();
                            }}
                            title="مناقشة المهمة"
                            disabled={isUpdating || isDeleting} // تعطيل الزر أثناء تحديث الحالة أو الحذف
                        >
                            <MessageCircle className="h-4 w-4" />
                        </Button>

                        {assigneeAttachment && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`p-0 h-7 w-7 ${hasDeliverables ? "text-blue-500 hover:text-blue-600 hover:bg-blue-50" : "text-muted-foreground hover:text-foreground"}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(assigneeAttachment.file_url, assigneeAttachment.file_name);
                                }}
                                title="تنزيل مرفق المكلف"
                                disabled={isUpdating || isDeleting} // تعطيل الزر أثناء تحديث الحالة أو الحذف
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        )}

                        {onEdit && canEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-7 w-7"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(task);
                                }}
                                title="تعديل المهمة"
                                disabled={isUpdating || isDeleting} // تعطيل الزر أثناء تحديث الحالة أو الحذف
                            >
                                <Edit className="h-4 w-4 text-amber-500 hover:text-amber-700" />
                            </Button>
                        )}

                        {onDelete && canEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-0 h-7 w-7"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteDialogOpen(true);
                                }}
                                title="حذف المهمة"
                                disabled={isUpdating || isDeleting} // تعطيل الزر أثناء تحديث الحالة أو الحذف
                            >
                                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                            </Button>
                        )}
                    </div>
                </TableCell>
            </TableRow>

            {showSubtasks && (
                <TableRow>
                    <TableCell colSpan={6} className="bg-gray-50 p-0">
                        <div className="p-3">
                            <SubtasksList taskId={task.id} projectId={projectId} />
                        </div>
                    </TableCell>
                </TableRow>
            )}

            <TaskDiscussionDialog
                open={showDiscussion}
                onOpenChange={setShowDiscussion}
                task={task}
                // onStatusChange={onStatusChange} // تم إزالة هذا الـ prop هنا أيضاً
            />

            <TaskDependenciesDialog
                open={showDependencies}
                onOpenChange={setShowDependencies}
                task={task}
                projectId={projectId}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف هذه المهمة؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف المهمة وجميع المهام الفرعية والمرفقات المرتبطة بها بشكل نهائي.
                            لا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting || isUpdating}>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting || isUpdating}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
