"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Bell, Check, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function NotificationsDropdown() {
  const router = useRouter()
  const notifications = useQuery(api.notifications.listMyNotifications, { limit: 10 })
  const unreadCount = useQuery(api.notifications.getUnreadCount)
  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)
  const deleteNotification = useMutation(api.notifications.deleteNotification)

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead({ notificationId: notification._id })
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({})
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all as read")
    }
  }

  const handleDelete = async (notificationId: any, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteNotification({ notificationId })
      toast.success("Notification deleted")
    } catch (error) {
      toast.error("Failed to delete notification")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount && unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount && unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
                onSelect={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={(e) => handleDelete(notification._id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500 absolute left-1 top-1/2 -translate-y-1/2" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

