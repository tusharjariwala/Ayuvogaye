import { Save } from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field } from "@/components/forms/form-field"
import { LANGUAGES } from "@/lib/constants"

const REGIONS = ["India", "United Arab Emirates", "United Kingdom", "United States"]
const TIMEZONES = ["Asia/Kolkata (IST, UTC+5:30)", "Asia/Dubai (GST, UTC+4)", "Europe/London (GMT/BST)", "America/New_York (ET)"]
const DATE_FORMATS = ["DD MMM YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]

function SimpleSelect({ id, value, onChange, options }: { id: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Language / region / timezone preferences (local state only). */
export function GeneralSettings() {
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [region, setRegion] = useState(REGIONS[0])
  const [timezone, setTimezone] = useState(TIMEZONES[0])
  const [dateFormat, setDateFormat] = useState(DATE_FORMATS[0])

  const save = (e: FormEvent) => {
    e.preventDefault()
    toast.success("Preferences saved (demo)", {
      description: `${language} · ${region} · ${timezone.split(" ")[0]}. The interface is English-only in this template.`,
    })
  }

  return (
    <Card>
      <form onSubmit={save}>
        <CardHeader>
          <h2 className="text-base font-semibold">Language & region</h2>
          <CardDescription>Choose how dates, times and content are presented to you.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 py-6 sm:grid-cols-2">
          <Field label="Language" htmlFor="pref-language" description="Translations are not included in the demo.">
            <SimpleSelect id="pref-language" value={language} onChange={setLanguage} options={LANGUAGES} />
          </Field>
          <Field label="Region" htmlFor="pref-region">
            <SimpleSelect id="pref-region" value={region} onChange={setRegion} options={REGIONS} />
          </Field>
          <Field label="Time zone" htmlFor="pref-timezone">
            <SimpleSelect id="pref-timezone" value={timezone} onChange={setTimezone} options={TIMEZONES} />
          </Field>
          <Field label="Date format" htmlFor="pref-date-format">
            <SimpleSelect id="pref-date-format" value={dateFormat} onChange={setDateFormat} options={DATE_FORMATS} />
          </Field>
        </CardContent>
        <CardFooter className="border-t">
          <Button type="submit">
            <Save /> Save preferences
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
