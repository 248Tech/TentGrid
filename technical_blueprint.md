1. Product vision

EventGrid is a collaborative, browser-based event layout tool that combines:

light CAD-style editing

venue/tent planning

sales quoting workflow

map/satellite visualization

AI-assisted layout interpretation and styling

The core value is that a sales rep can go from client inquiry → layout draft → capacity estimate → visual presentation → saved project/quote asset without leaving the app.

2. Core product goals

EventGrid should solve these problems well:

Fast layout creation
Sales teams need to drag in tents, tables, chairs, stages, bars, dance floors, etc. and get a plan built quickly.

Accurate sizing
Objects must have real-world dimensions and snap cleanly to a measurement grid.

Quote support
Layouts should drive guest count, rental counts, and event configuration summaries.

Venue visualization
Users should be able to see designs over a plain grid or a satellite/base map.

Repeatability
Save projects, reuse templates, search by client/event data, and maintain persistent event records.

Team collaboration
Multiple internal users should be able to access and edit project files on a shared hosted system.

AI assistance
Use AI for:

diagram interpretation from uploads

object skin generation

future smart layout suggestions

3. MVP scope

To avoid building a bloated CAD product too early, I’d recommend a phased rollout.

Phase 1 — MVP

Build the core workflow first:

Canvas / editor

Grid-based editor

Zoom, pan, drag

Snap-to-grid toggle

Rotate objects

Resize supported objects

Undo / redo

Layer ordering (forward/backward)

Text labels

Basic shape tool

Measurement / ruler tool

Image upload as overlay object

Library

Tents

Tables

Chairs

Stages

Dance floors

Bars

Restrooms

Lounge furniture

Fencing / barriers

Generic rectangles/circles/polygons

Tent / venue tools

Create tent by:

square

oval

rectangle

polygon

Ask:

dimensions

side count for polygon

Venue boundary creation

Save venue definitions

Business workflow

Client/project metadata:

project number

first name

last name

venue name

event date

address

Search projects

Save layouts as projects

Save layouts as templates

Auto-save after every change

Manual save/version snapshot

Export

PNG export

PDF export

Reporting

Guest count estimate

Object count summary

Table numbering

Map view

Mapbox integration

Toggle:

plain grid

satellite overlay

Phase 2 — Advanced functionality

After MVP is stable:

AI upload-to-diagram

Auto alignment suggestions

Object attachment logic

Smart skins/material generation

Multi-user concurrent editing

Approval/commenting workflow

Quote integration with rental catalog/pricing

CRM or ERP integration

Mobile/tablet optimized field mode

4. High-level user experience
Entry flow

User opens app and can choose:

New Project

From Template

Open Existing Project

Open Venue

Upload Diagram / Site Plan

Project setup modal

Before canvas loads:

project #

client name

venue name

event date

address

template selection

choose map/grid mode

Editor layout

A strong UI would resemble a lighter mix of:

Figma

Canva

Photoshop layer panel

simple CAD editor

Suggested layout

Top bar

Project name

Save status

Undo/redo

Zoom %

Export

View toggle

AI tools

Left sidebar

Tool palette

Object library

Tent tool

Venue tool

Text tool

Shape tool

Ruler

Upload image

Center

Main canvas/grid

gray neutral working background

optional satellite base

snapping + smart guides

Right sidebar

Properties panel for selected object

dimensions

rotation

layer position

fill/skin/material

attachment settings

count / table number

metadata

Bottom or collapsible side panel

Layers panel

Object list

Counts

warnings / validations

5. Core features broken down
A. Canvas / editor engine

This is the heart of the product.

Requirements

Infinite or large bounded canvas

Grid rendering

Pan/zoom

Multi-select

Drag and drop

Snap-to-grid

Snap-to-object edges/centers

Rotation handles

Resize handles

Keyboard shortcuts

Layer ordering

Group/ungroup

Copy/paste/duplicate

Lock/unlock objects

Hide/show layers

Undo/redo history

Recommendation

Use a React + canvas-based rendering engine rather than trying to do everything in DOM.

Best fit:

Konva / React Konva for MVP speed

Later, if needed, move heavy scenes to PixiJS or WebGL-based renderer

Why Konva is a good MVP fit:

strong support for drag/drop

shapes

transformations

selection boxes

events

export to image

easier than raw canvas

B. Object system

Every object should be a data-driven entity.

Example object categories

Furniture

Tent structures

Decor

Utility

Stage/audio

Venue elements

Uploaded overlays

Custom shapes

Text labels

Object model

Each object should have:

id

type

subtype

x, y

width, height

rotation

zIndex

layerId

locked

visible

snapEnabled

dimensions in feet/inches or metric

style/skin

metadata

parent/attachment relationship

quantity rules

collision box

anchor points

This data-first model is important because it powers:

rendering

saving

export

AI interpretation

guest count logic

reporting

C. Tent builder

This deserves its own module.

Tent creation flow

Choose shape:

square

rectangle

oval

polygon

Enter dimensions

If polygon:

enter number of sides

Optional:

wall segments

entrances

pole placements

tent orientation

Generate tent footprint on canvas

Internally

Represent tents as:

geometry footprint polygon

anchor points

structural metadata

style/skin config

Later you can add:

pole placement logic

span constraints

sidewall segmentation

subflooring overlays

D. Venue builder

Venues are more than just a background.

Venue model

venue boundary polygon

address

GPS location

default map center

venue obstacles

permanent fixtures

loading areas

entrances/exits

utilities

terrain notes

Venue use cases

create reusable venues as templates

overlay layouts on real locations

persist venue definitions for reuse

E. Attachment system

This is a smart productivity feature.

Examples:

8 chairs attached to a round table

buffet pieces attached into a line

stage stairs attached to stage

tent accessories attached to tent perimeter

Approach

Create a parent-child relationship:

parent object defines anchors

child objects can snap to predefined anchor slots

moving/rotating the parent updates children

For example:

a 60” round table can have 8 chair anchor points evenly spaced

a rectangular banquet table can have preset seating anchors on each side

This is extremely useful and should be in MVP if possible.

F. Auto guest count and table numbering

This directly supports sales.

Auto guest count

Calculate using:

seatable chairs attached to tables

loose seating objects

standing-room assumptions

custom overrides

Table numbering

auto sequential numbering

zone-based numbering

prefix support (A1, A2, B1)

renumber selected objects only

G. Alignment tools

Requested feature is good and practical.

Two modes

Snap-to-grid

on/off toggle

Align objects to grid

batch alignment after objects are placed

Smart alignment tool

Detect selected object types:

align all selected tables

align chairs relative to tables

distribute evenly

align by center/left/top

straighten rows

This can be a contextual panel action.

H. Layers panel

This should work a lot like Photoshop/Figma, but simpler.

Layer features

reorder drag/drop

bring forward/backward

send to front/back

group objects

lock layer

hide layer

rename layer

color tags

filter by type

Suggested default layers

base map

venue boundary

tent

furniture

decor

labels

uploaded overlays

measurements

I. Image overlays

Useful for floor plans, scanned diagrams, logos, seating references.

Needs

upload PNG/JPEG

place on canvas

resize/rotate

control opacity

lock in place

layer order

optional calibration to scale

That last one is important:

user sets two known points

enters real distance

image becomes to-scale

J. AI upload to diagram

Very valuable, but should be designed carefully.

User flow

Upload:

hand sketch

PDF floor plan

aerial screenshot

scanned diagram

AI then attempts to:

detect boundaries

identify tables/chairs/tents/stages

infer scale

convert to editable objects

Technical architecture

This should be an asynchronous processing service:

file upload

preprocessing

vision model extraction

geometry normalization

confidence scoring

editable draft returned to editor

Practical MVP

Do not promise perfect detection.
Start with:

boundary extraction

rectangle/circle/polygon recognition

text OCR optionally later

manual confirmation step

K. Smart skins / material generation

This is mostly a presentation layer feature.

Examples:

wood grain table surface

white vinyl tent

black stage deck

turf flooring

linen table coverings

Implementation idea

Each object has:

default vector style

optional texture/skin asset

optional AI-generated texture

For MVP:

use curated material presets first

AI skin generation can be phase 2

Reason:
AI-generated textures can become messy and inconsistent unless tightly controlled.

6. Recommended tech stack
Frontend
Core

React

TypeScript

Vite or Next.js

I would choose:

Best choice: Next.js + TypeScript

Why:

server-hosted multi-user app

built-in routing

API routes if needed

auth-friendly

easier deployment

supports admin/search/project pages well

UI

Tailwind CSS

shadcn/ui for modern components

Lucide icons

Canvas/editor

React Konva for 2D editor rendering

optional dnd-kit for complex panel drag/drop interactions

State management

Zustand for editor state

React Query / TanStack Query for server state

Immer for immutable update ergonomics

Forms

React Hook Form

Zod for schema validation

Maps

Mapbox GL JS or MapLibre depending on licensing and cost considerations

Since you explicitly want Mapbox overlay, use Mapbox

Export

PNG via canvas export

PDF via:

server-side PDF composition

or client-side pdf-lib

Backend
Language/runtime

Node.js + TypeScript

Framework

NestJS or Fastify/Express

My recommendation: NestJS

Why NestJS:

scalable architecture

clean modules

good for auth, jobs, file processing, admin workflows

strong TypeScript support

Database
Primary DB

PostgreSQL

Why:

relational project/client/template data

good GIS support if you later use PostGIS

reliable for search/filtering/project records

ORM

Prisma

Why:

productive developer experience

good TypeScript integration

clear schema management

File storage

AWS S3
For:

uploaded overlays

exported PDFs/PNGs

AI-processed files

template assets

skin textures

Realtime / collaboration

For MVP, you may not need true Figma-style collaboration.
Start with:

autosave + edit locking

presence indicator optionally

Later:

WebSockets / Socket.IO

or Liveblocks / Yjs for multiplayer editing

Search

Use PostgreSQL search first.
Then, if needed:

Meilisearch or Elasticsearch/OpenSearch

Search fields:

project #

client first name

client last name

venue name

address

event date

AI services
For upload interpretation

Computer vision / multimodal model pipeline

Python microservice can help here

For smart skins

image generation endpoint or texture generation pipeline

Architecture recommendation

Keep AI separate from core app:

Node/NestJS app = main business app

Python AI service = diagram interpretation / texture generation

This prevents AI experiments from destabilizing the main product.

Background jobs

Use:

BullMQ + Redis

For:

AI diagram processing

exports

thumbnail generation

template processing

image calibration jobs

Auth

Auth.js or Clerk

enterprise/internal roles later

Roles:

admin

sales

designer

viewer

Hosting
Good production setup

Frontend: Vercel or AWS

Backend/API: AWS ECS / Render / Railway / Fly.io

Database: managed PostgreSQL

Storage: S3

Redis: Upstash / ElastiCache

If you want one cleaner AWS-native stack:

Next.js frontend

NestJS on ECS or App Runner

PostgreSQL on RDS

Redis on ElastiCache

S3 for assets

CloudFront CDN

7. Suggested architecture
Frontend modules

project-dashboard

project-search

template-library

venue-library

editor-canvas

layer-panel

object-library

properties-panel

reporting-panel

export-panel

map-overlay-view

ai-upload-flow

Backend modules

auth

users

projects

templates

venues

objects

layouts

uploads

exports

search

ai

audit

notifications

8. Data model outline
Main entities
User

id

name

email

role

teamId

Team

id

name

settings

Project

id

projectNumber

firstName

lastName

venueName

eventDate

address

status

templateId

venueId

createdBy

updatedBy

timestamps

LayoutDocument

id

projectId

canvasStateJson

version

thumbnailUrl

mapViewState

countsSummary

autosavedAt

Venue

id

name

address

coordinates

geometryJson

notes

Template

id

name

category

previewUrl

canvasStateJson

Asset

id

type

fileUrl

thumbnailUrl

metadata

LibraryObjectDefinition

id

type

subtype

defaultDimensions

anchorDefinitions

styleDefaults

capacityRules

pricingLink optional

9. Canvas state structure

A clean JSON document structure is critical.

Example shape:

type CanvasDocument = {
  id: string;
  version: number;
  units: 'ft' | 'in' | 'm';
  grid: {
    enabled: boolean;
    size: number;
    snapEnabled: boolean;
    color: string;
  };
  viewport: {
    zoom: number;
    x: number;
    y: number;
    rotation?: number;
  };
  background: {
    mode: 'grid' | 'satellite' | 'hybrid';
    mapbox?: {
      center: [number, number];
      zoom: number;
      bearing?: number;
      pitch?: number;
    };
  };
  layers: Layer[];
  objects: CanvasObject[];
  metadata: {
    guestCount?: number;
    tableCount?: number;
    notes?: string;
  };
};

Each object can be serialized cleanly for save, export, and AI processing.

10. UX features that will matter a lot

These sound small, but they’ll make or break adoption.

Must-have interaction details

smooth drag performance

visible snap guides

precise numeric dimension input

keyboard nudging

duplicate with modifier key

rotate with angle entry

right-click context menu

shift multi-select

clear layer visibility

subtle shadow/highlight for selected object

autosave indicator

“unsaved changes” protection

fast template loading

Helpful keyboard shortcuts

Cmd/Ctrl + Z undo

Cmd/Ctrl + Shift + Z redo

Delete remove

Cmd/Ctrl + D duplicate

arrow keys nudge

Shift constrain movement/rotation

Space pan

11. Reporting and sales support

This product becomes much more valuable if it helps quoting.

Generated summaries

total guest count

seated guest count

cocktail capacity

number of tables by type

number of chairs by type

stage count

tent dimensions

square footage used

notes and labels summary

Future quote integration

Later, every object can map to:

rental SKU

internal cost

quoted price

setup labor estimate

That turns EventGrid into not just a design tool, but a sales operations platform.

12. AI strategy

You mentioned two AI directions:

upload-to-diagram interpretation

smart skins/material generation

I’d strongly separate them.

AI feature 1: Diagram interpretation

More important for workflow efficiency.
This should come earlier.

Good MVP version

upload image/PDF

detect primary shapes

convert into editable draft

user confirms and adjusts

AI feature 2: Smart skins

Mostly visual enhancement.
Lower business value initially.

Better early version

predefined material palette

later allow “generate texture from prompt”

13. Product roadmap recommendation
Stage 1: Foundation

auth

projects

templates

venue library

canvas

object library

save/load

autosave

exports

Stage 2: Business workflows

project search

guest counts

table numbering

attachment logic

alignment tools

map overlay

image overlays

version history

Stage 3: AI and advanced polish

upload-to-diagram

smart skins

collision warnings

smart layout suggestions

multi-user collaboration

quote integration

14. Team roles needed to build this

A practical early team:

1 product-minded frontend engineer

React editor/canvas

1 backend/full-stack engineer

projects, saves, exports, auth, DB

1 designer

editor UX matters a lot here

1 part-time AI/vision engineer

once upload interpretation starts

1 PM/founder stakeholder

defines actual event workflow and library accuracy

This app will live or die on editor UX, not just backend architecture.

15. Biggest technical risks
1. Overbuilding CAD complexity

Don’t try to build AutoCAD in version one.
Focus on event-sales speed, not engineering perfection.

2. Poor canvas performance

Keep object model lean.
Virtualize side panels and optimize rerenders.

3. Bad save model

If canvas data structure is messy, templates/export/search/versioning will become painful.

4. AI overpromising

Upload-to-diagram should always return an editable draft, not a “final truth.”

5. Map overlay complexity

Coordinate calibration between layout units and satellite view can get tricky.
Treat this as a dedicated geometry subsystem.

16. My recommended exact stack

If I were building EventGrid today, I’d use:

Frontend

Next.js

TypeScript

Tailwind CSS

shadcn/ui

React Konva

Zustand

TanStack Query

React Hook Form

Zod

Backend

NestJS

Prisma

PostgreSQL

Redis

BullMQ

Infrastructure

AWS S3

RDS PostgreSQL

ElastiCache Redis

ECS/App Runner

CloudFront

Maps / export / AI

Mapbox

pdf-lib

server-side image export pipeline

Python microservice for AI interpretation

That stack is modern, maintainable, and strong for a multi-user business app.

17. Suggested MVP feature list in one clean package
EventGrid MVP

login + teams

project dashboard

project metadata

searchable project list

venue library

template library

grid-based canvas editor

drag/drop object library

tents: square, rectangle, oval, polygon

dimensions + side count input

rotate, resize, duplicate

text tool

basic shape tool

ruler tool

image upload overlay

snap-to-grid toggle

align-to-grid actions

layer panel

attach chairs to tables

guest count summary

auto table numbering

autosave

manual save/version

export PNG/PDF

Mapbox satellite overlay mode

That is already a very compelling first product.

18. Positioning statement

A clean marketable way to describe it:

EventGrid is a lightweight event layout and tent planning platform that helps sales and operations teams design, size, visualize, and quote event setups faster.

Or more directly:

EventGrid is modern event CAD for tenting, venue layout, and sales quoting.

19. Final recommendation

The smartest way to build this is:

treat it as a layout editor first

a sales workflow tool second

an AI platform third

That order matters.

If you nail:

fast drag/drop editing

precise dimensions

object attachment

templates

autosave

export

satellite overlay

then EventGrid will already feel valuable before the AI pieces are fully mature.