"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { signOut } from "@/lib/workos/auth"
import { LogOut, User, Bell, Palette, Shield, Upload, Check, Sun, Moon, Monitor } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { AccentColorPicker } from "@/components/accent-color-picker"
import { useAccent } from "@/contexts/accent-context"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/lib/convex"

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { accentColor } = useAccent()
  const updateAccentColorByEmail = useMutation(api.users.updateAccentColorByEmail)
  const dbUser = useQuery(api.users.getCurrentUserQuery)
  
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [profilePicture, setProfilePicture] = useState(user?.profilePictureUrl || "")
  const [selectedAccent, setSelectedAccent] = useState(accentColor)
  const [isUploading, setIsUploading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  async function handleSignOut() {
    // Clear local storage before signing out
    if (typeof window !== 'undefined') {
      localStorage.removeItem('snooze_authenticated');
      localStorage.removeItem('onboarding_completed');
      localStorage.removeItem('spotlight_onboarding_completed');
    }
    
    toast.success("Signing out...");
    await signOut();
  }

  async function handleProfilePictureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB")
      return
    }

    setIsUploading(true)
    
    try {
      // Convert to base64 for preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
        setHasChanges(true)
        toast.success("Profile picture updated (click Save to confirm)")
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSaveProfile() {
    if (!hasChanges) return

    // Note: In a real implementation, you would send this to your backend
    // which would then update WorkOS user management
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setHasChanges(false)
          resolve(true)
        }, 1000)
      }),
      {
        loading: "Saving changes...",
        success: "Profile updated successfully!",
        error: "Failed to update profile"
      }
    )
  }

  function handleThemeChange(newTheme: string) {
    setTheme(newTheme)
    toast.success(`Theme changed to ${newTheme}`)
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <User className="h-5 w-5" />
          <div>
            <h2 className="font-semibold">Profile</h2>
            <p className="text-sm text-muted-foreground">Update your personal information</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profilePicture} />
              <AvatarFallback className="text-2xl">
                {(firstName?.[0] || user?.firstName?.[0] || "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                id="profile-upload"
                className="hidden"
                accept="image/*"
                onChange={handleProfilePictureChange}
                disabled={isUploading}
              />
              <label htmlFor="profile-upload">
                <Button size="sm" variant="outline" disabled={isUploading} asChild>
                  <span className="cursor-pointer">
                    {isUploading ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Change Photo
                      </>
                    )}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={e => {
                    setFirstName(e.target.value)
                    setHasChanges(true)
                  }}
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={e => {
                    setLastName(e.target.value)
                    setHasChanges(true)
                  }}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {hasChanges && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setFirstName(user?.firstName || "")
                  setLastName(user?.lastName || "")
                  setProfilePicture(user?.profilePictureUrl || "")
                  setHasChanges(false)
                  toast.info("Changes discarded")
                }}
              >
                Discard
              </Button>
            )}
            <Button onClick={handleSaveProfile} disabled={!hasChanges}>
              {hasChanges ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                "No Changes"
              )}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Palette className="h-5 w-5" />
          <div>
            <h2 className="font-semibold">Appearance</h2>
            <p className="text-sm text-muted-foreground">Customize how Snooze looks</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Theme</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Select your preferred theme or use system settings
            </p>
            <div className="flex gap-3">
              <Button 
                size="sm" 
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => handleThemeChange("light")}
                className="flex-1"
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button 
                size="sm" 
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => handleThemeChange("dark")}
                className="flex-1"
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
              <Button 
                size="sm" 
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => handleThemeChange("system")}
                className="flex-1"
              >
                <Monitor className="h-4 w-4 mr-2" />
                System
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label>Accent Color</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Choose your favorite color to personalize the app
            </p>
            <AccentColorPicker 
              value={selectedAccent} 
              onChange={async (color) => {
                setSelectedAccent(color)
                
                // Save to localStorage immediately for persistence
                localStorage.setItem('accentColor', color)
                
                // Update DOM for instant feedback
                document.documentElement.setAttribute("data-accent", color)
                
                // Show immediate feedback
                toast.success("Accent color changed!")
                
                // Save to database using email (works even if Convex auth identity is delayed)
                if (user?.email) {
                  try {
                    await updateAccentColorByEmail({ 
                      email: user.email,
                      accentColor: color 
                    })
                    console.log("Accent color saved to database")
                  } catch (error: any) {
                    console.log("Could not save to database:", error.message)
                  }
                }
              }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Bell className="h-5 w-5" />
          <div>
            <h2 className="font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Task Reminders</div>
              <div className="text-sm text-muted-foreground">Get notified about upcoming tasks</div>
            </div>
            <Button size="sm" variant="outline">Enable</Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Daily Summary</div>
              <div className="text-sm text-muted-foreground">Receive daily productivity summary</div>
            </div>
            <Button size="sm" variant="outline">Enable</Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Habit Reminders</div>
              <div className="text-sm text-muted-foreground">Get reminded about your daily habits</div>
            </div>
            <Button size="sm" variant="outline">Enable</Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-destructive/50">
        <div className="flex items-center gap-4 mb-6">
          <Shield className="h-5 w-5 text-destructive" />
          <div>
            <h2 className="font-semibold">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">Irreversible account actions</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <div className="font-medium">Sign Out</div>
              <div className="text-sm text-muted-foreground">Sign out of your account on this device</div>
            </div>
            <Button size="sm" variant="destructive" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <div className="font-medium">Delete Account</div>
              <div className="text-sm text-muted-foreground">Permanently delete your account and all data</div>
            </div>
            <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
